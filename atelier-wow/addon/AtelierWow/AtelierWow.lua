-- Atelier WoW (Forever, interface 16001).
-- Lecture locale seulement. Aucun accès réseau ni envoi automatique.
-- Les données des emplacements fermés restent en cache, avec une date de relevé.
AtelierWowDB = AtelierWowDB or {characters={}}
AtelierWowExportJSON = AtelierWowExportJSON or ""
if type(AtelierWowDB.characters)~="table" then AtelierWowDB.characters={} end

local prefix="|cffd7b878Atelier WoW|r "
local function say(s) if DEFAULT_CHAT_FRAME then DEFAULT_CHAT_FRAME:AddMessage(prefix..tostring(s)) end end
local function call(fn,...)
  if type(fn)~="function" then return nil end
  local ok,a,b,c,d,e,f,g,h=pcall(fn,...)
  if ok then return a,b,c,d,e,f,g,h end
  return nil
end
local function arr() return {__arr=true} end
local function jsonQuote(s)
  s=tostring(s or "")
  s=s:gsub("\\","\\\\"):gsub('"','\\"'):gsub("\r","\\r"):gsub("\n","\\n"):gsub("\t","\\t")
  s=s:gsub("[%z\1-\8\11\12\14-\31]", "?")
  return '"'..s..'"'
end
local function json(t,depth)
  depth=depth or 0
  if depth>16 then return "null" end
  local typ=type(t)
  if typ=="nil" then return "null" end
  if typ=="boolean" then return t and "true" or "false" end
  if typ=="number" then return (t==t and t~=math.huge and t~=-math.huge) and tostring(t) or "null" end
  if typ=="string" then return jsonQuote(t) end
  if typ~="table" then return "null" end
  local parts={}
  if t.__arr then
    for i=1,#t do parts[#parts+1]=json(t[i],depth+1) end
    return "["..table.concat(parts,",").."]"
  end
  for k,v in pairs(t) do
    if type(k)=="string" and k~="__arr" then
      parts[#parts+1]=jsonQuote(k)..":"..json(v,depth+1)
    end
  end
  return "{"..table.concat(parts,",").."}"
end
local function now() return call(time) or 0 end
local function player()
  local name=call(UnitName,"player") or "Inconnu"
  local faction=call(UnitFactionGroup,"player") or "Alliance"
  local _,class=call(UnitClass,"player")
  local c=AtelierWowDB.characters[name]
  if not c then
    c={name=name,items=arr(),professions=arr(),coverage={}}
    AtelierWowDB.characters[name]=c
  end
  c.name=name;c.faction=faction;c.class=class or c.class
  c.level=call(UnitLevel,"player") or c.level
  c.money=call(GetMoney) or c.money
  c.scannedAt=now()
  c.coverage=c.coverage or {}
  if not c.items then c.items=arr() end
  if not c.professions then c.professions=arr() end
  c.items.__arr=true;c.professions.__arr=true
  return c
end
local function itemName(id)
  local a
  if C_Item then a=call(C_Item.GetItemInfo,id) end
  return type(a)=="string" and a or ("Objet "..tostring(id))
end
local function scanContainer(bag,label,dest)
  if not C_Container then return false end
  local slots=call(C_Container.GetContainerNumSlots,bag)
  if type(slots)~="number" then return false end
  for slot=1,slots do
    local v=call(C_Container.GetContainerItemInfo,bag,slot)
    if type(v)=="table" and (v.itemID or v.hyperlink) then
      local id=v.itemID
      if not id and v.hyperlink then id=tonumber(v.hyperlink:match("item:(%d+)")) end
      if id then
        dest[#dest+1]={itemId=id,name=itemName(id),count=tonumber(v.stackCount) or 1,location=label,seenAt=now()}
      end
    end
  end
  return true
end
local function replaceLocations(c,labels,rows)
  local old=c.items or arr()
  local out=arr()
  for _,it in ipairs(old) do if not labels[it.location] then out[#out+1]=it end end
  for _,it in ipairs(rows) do out[#out+1]=it end
  c.items=out
end
local function scanBags()
  local c=player();local rows=arr();local labels={}
  local ok=false
  for bag=0,5 do
    local label=(bag==5) and "Sac de composants" or ("Sac "..bag)
    if scanContainer(bag,label,rows) then labels[label]=true;ok=true end
  end
  if ok then replaceLocations(c,labels,rows);c.coverage.bags={status="scanned",at=now()} end
end
local function scanBank()
  local c=player();local rows=arr();local labels={}
  local groups={{-1,"Banque principale"},{-3,"Banque de composants"}}
  for i=6,12 do groups[#groups+1]={i,"Sac banque "..i} end
  local ok=false
  for _,v in ipairs(groups) do
    if scanContainer(v[1],v[2],rows) then labels[v[2]]=true;ok=true end
  end
  if ok then replaceLocations(c,labels,rows);c.coverage.bank={status="scanned",at=now()}
  else c.coverage.bank=c.coverage.bank or {status="not-scanned"} end
end
local function scanProfessionRanks()
  local c=player()
  if type(GetProfessions)~="function" or type(GetProfessionInfo)~="function" then return end
  local slots={call(GetProfessions)}
  for _,index in ipairs(slots) do
    if type(index)=="number" then
      local name,_,skill,max=call(GetProfessionInfo,index)
      if name and type(skill)=="number" then
        local old=nil
        for _,p in ipairs(c.professions) do if p.name==name then old=p;break end end
        if not old then old={name=name,recipes=arr()};c.professions[#c.professions+1]=old end
        old.skill=skill;old.max=max;old.scannedAt=now()
      end
    end
  end
end
local function collectReagents(recipeId)
  local result=arr()
  if not C_TradeSkillUI then return result end
  local sch=call(C_TradeSkillUI.GetRecipeSchematic,recipeId,false)
  if type(sch)~="table" then return result end
  local slots=sch.reagentSlotSchematics or sch.reagents
  if type(slots)~="table" then return result end
  for _,slot in ipairs(slots) do
    local reagents=slot.reagents or {slot}
    local first=reagents[1]
    local itemId=first and (first.itemID or first.itemId)
    if itemId then result[#result+1]={itemId=itemId,name=itemName(itemId),quantity=slot.quantityRequired or slot.quantity or first.quantity or 1} end
  end
  return result
end
local function activeProfession()
  local info=C_TradeSkillUI and call(C_TradeSkillUI.GetBaseProfessionInfo)
  if type(info)=="table" then
    return info.professionName or info.name or info.parentProfessionName or "Métier actif",info.skillLevel or info.skill or 0,info.maxSkillLevel or info.maxSkill or 0
  end
  local name,a,b=call(GetTradeSkillLine)
  if type(name)=="string" then return name,a,b end
  return "Métier actif",0,0
end
local function scanRecipes()
  if not C_TradeSkillUI or type(C_TradeSkillUI.GetAllRecipeIDs)~="function" then return end
  local ids=call(C_TradeSkillUI.GetAllRecipeIDs)
  if type(ids)~="table" then return end
  local c=player()
  local name,rank,max=activeProfession()
  local p=nil
  for _,prof in ipairs(c.professions) do if prof.name==name then p=prof;break end end
  if not p then p={name=name,skill=rank,max=max,recipes=arr()};c.professions[#c.professions+1]=p end
  p.skill=(rank and rank>0) and rank or p.skill
  p.max=(max and max>0) and max or p.max
  local known=arr()
  for _,id in ipairs(ids) do
    local info=call(C_TradeSkillUI.GetRecipeInfo,id)
    if type(info)=="table" and info.learned then
      known[#known+1]={id=id,name=info.name or ("Recette "..id),reagents=collectReagents(id)}
    end
  end
  -- Only replace when at least one learned recipe was visible.
  if #known>0 then
    p.recipes=known;p.scannedAt=now()
    c.coverage.recipes={status="scanned-active-profession",name=name,at=now(),count=#known}
  end
end
local function serialize()
  local payload={schema="atelierwow-v1",characters=arr(),exportedAt=now()}
  for _,v in pairs(AtelierWowDB.characters) do
    if type(v)=="table" then
      v.items=v.items or arr();v.items.__arr=true
      v.professions=v.professions or arr();v.professions.__arr=true
      for _,p in ipairs(v.professions) do p.recipes=p.recipes or arr();p.recipes.__arr=true end
      payload.characters[#payload.characters+1]=v
    end
  end
  AtelierWowExportJSON=json(payload)
end
local function all()
  scanBags();scanProfessionRanks();scanRecipes();serialize()
end
local f=CreateFrame("Frame")
f:RegisterEvent("PLAYER_LOGIN")
f:RegisterEvent("BAG_UPDATE_DELAYED")
f:RegisterEvent("BANKFRAME_OPENED")
f:RegisterEvent("PLAYERBANKSLOTS_CHANGED")
f:RegisterEvent("PLAYERREAGENTBANKSLOTS_CHANGED")
f:RegisterEvent("TRADE_SKILL_SHOW")
f:RegisterEvent("TRADE_SKILL_LIST_UPDATE")
f:RegisterEvent("PLAYER_MONEY")
f:RegisterEvent("PLAYER_LOGOUT")
f:SetScript("OnEvent",function(_,event)
  if event=="PLAYER_LOGIN" then all();say("Pret. /atelierwow scan | /atelierwow etat | /reload pour enregistrer.")
  elseif event=="BAG_UPDATE_DELAYED" then scanBags();serialize()
  elseif event=="BANKFRAME_OPENED" or event=="PLAYERBANKSLOTS_CHANGED" or event=="PLAYERREAGENTBANKSLOTS_CHANGED" then scanBank();serialize()
  elseif event=="TRADE_SKILL_SHOW" or event=="TRADE_SKILL_LIST_UPDATE" then scanProfessionRanks();scanRecipes();serialize()
  elseif event=="PLAYER_MONEY" then player();serialize()
  elseif event=="PLAYER_LOGOUT" then all() end
end)
SLASH_ATELIERWOW1="/atelierwow"
SlashCmdList.ATELIERWOW=function(msg)
  msg=(msg or ""):lower()
  if msg=="scan" then all();say("Releve actualise. Ouvre banque et fenetres de metiers, puis /reload.")
  elseif msg=="etat" then
    local c=player()
    say(c.name..": "..#c.items.." piles d'objets, "..#c.professions.." metiers; banque="..tostring(c.coverage.bank and c.coverage.bank.status or "non scannee"))
  else say("/atelierwow scan pour relever les donnees, /atelierwow etat pour verifier, puis /reload") end
end
