import { describe,expect,it } from "vitest";
import { avatarHairStyles,neutralAvatar,normalizeAvatar,selectPresentation } from "./avatar";
describe("avatar",()=>{
 it("migra configuração inválida para fallback neutro",()=>{expect(normalizeAvatar({skinToneId:"inexistente"}).skinToneId).toBe(neutralAvatar.skinToneId);});
 it("mantém identificadores válidos",()=>{const value=normalizeAvatar({...neutralAvatar,presentation:"feminino",hairStyleId:"hair_f_10",accessoryId:"glasses"});expect(value.hairStyleId).toBe("hair_f_10");expect(value.accessoryId).toBe("glasses");});
 it("troca apresentação sem carregar penteado incompatível",()=>{expect(selectPresentation(neutralAvatar,"feminino").hairStyleId).toBe(avatarHairStyles.feminino[0].id);});
});