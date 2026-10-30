import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import type { BibleStudyNote, StudyNoteBlock, StudyNoteBlockType } from "../../src/types/progress";
import { colors, radius, spacing } from "../theme/tokens";
import { PrimaryButton } from "./PrimaryButton";

const COMMANDS:{command:string;label:string;type:StudyNoteBlockType}[]=[
 {command:"/texto",label:"Texto",type:"paragraph"},
 {command:"/titulo",label:"Título",type:"heading"},
 {command:"/lista",label:"Lista",type:"list"},
 {command:"/citacao",label:"Citação",type:"quote"},
 {command:"/tabela",label:"Tabela",type:"table"},
 {command:"/passagem",label:"Passagem bíblica",type:"passage"}
];

function id(prefix:string){
 return globalThis.crypto?.randomUUID?.()??prefix+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
}
function newBlock(type:StudyNoteBlockType,reference?:string):StudyNoteBlock{
 const now=new Date().toISOString();
 return {id:id("block"),type,content:"",reference:type==="passage"?reference:undefined,createdAt:now,updatedAt:now};
}
function newNote(bookOsis:string,bookName:string,chapter:number,reference?:string):BibleStudyNote{
 const now=new Date().toISOString();
 return {id:id("note"),title:bookName+" "+chapter,bookOsis,bookName,chapter,pinned:false,blocks:[newBlock("paragraph",reference)],comments:[],createdAt:now,updatedAt:now};
}
const blockLabel:Record<StudyNoteBlockType,string>={
 paragraph:"Texto",heading:"Título",list:"Lista",quote:"Citação",table:"Tabela",image:"Imagem",passage:"Passagem bíblica"
};

export function BibleStudyNotebook({visible,onClose,bookOsis,bookName,chapter,verse,notes,onSave,onRemove}:{
 visible:boolean;onClose:()=>void;bookOsis:string;bookName:string;chapter:number;verse?:number;
 notes:BibleStudyNote[];onSave:(note:BibleStudyNote)=>void;onRemove:(id:string)=>void;
}){
 const chapterNotes=useMemo(()=>notes.filter(note=>note.bookOsis===bookOsis&&note.chapter===chapter)
  .sort((a,b)=>Number(b.pinned)-Number(a.pinned)||b.updatedAt.localeCompare(a.updatedAt)),[bookOsis,chapter,notes]);
 const reference=bookName+" "+chapter+(verse?":"+verse:"");
 const [draft,setDraft]=useState<BibleStudyNote>(()=>chapterNotes[0]??newNote(bookOsis,bookName,chapter,reference));
 const [entry,setEntry]=useState("");
 const [commentBlock,setCommentBlock]=useState<string>();
 const [commentBody,setCommentBody]=useState("");
 const [verseCommentBody,setVerseCommentBody]=useState("");
 const [notice,setNotice]=useState("");
 const {width}=useWindowDimensions();
 const wide=width>=900;

 useEffect(()=>{if(!visible)return;setDraft(chapterNotes[0]??newNote(bookOsis,bookName,chapter,reference));setNotice("");},[visible,bookOsis,bookName,chapter,verse]);
 const touch=(next:BibleStudyNote)=>setDraft({...next,updatedAt:new Date().toISOString()});
 const updateBlock=(blockId:string,content:string)=>touch({...draft,blocks:draft.blocks.map(block=>block.id===blockId?{...block,content,updatedAt:new Date().toISOString()}:block)});
 const addBlock=(type:StudyNoteBlockType)=>{touch({...draft,blocks:[...draft.blocks,newBlock(type,reference)]});setEntry("");};
 const submitEntry=()=>{const value=entry.trim();if(!value)return;const command=COMMANDS.find(item=>item.command===value.toLocaleLowerCase("pt-BR"));if(command){addBlock(command.type);return;}const block={...newBlock("paragraph"),content:value};touch({...draft,blocks:[...draft.blocks,block]});setEntry("");};
 const addComment=(anchorBlockId:string)=>{const body=commentBody.trim();if(!body)return;const now=new Date().toISOString();touch({...draft,comments:[...draft.comments,{id:id("comment"),anchorBlockId,body,createdAt:now,updatedAt:now}]});setCommentBody("");setCommentBlock(undefined);};
 const addVerseComment=()=>{const body=verseCommentBody.trim();if(!body||!verse)return;const now=new Date().toISOString();touch({...draft,comments:[...draft.comments,{id:id("comment"),anchorVerse:verse,body,createdAt:now,updatedAt:now}]});setVerseCommentBody("");};
 const save=()=>{onSave({...draft,updatedAt:new Date().toISOString()});setNotice("Nota salva e preparada para sincronização.");};
 return <Modal visible={visible} transparent={wide} presentationStyle={wide?"overFullScreen":"fullScreen"} animationType="slide" onRequestClose={onClose}>
  <View style={[styles.modalRoot,wide&&styles.modalRootWide]}>
  <View style={[styles.page,wide&&styles.pageWide]}>
   <View style={styles.header}><View style={styles.headerText}><Text style={styles.eyebrow}>CADERNO DE ESTUDO</Text><Text style={styles.reference}>{reference}</Text></View><Pressable accessibilityRole="button" onPress={onClose} style={styles.close}><Text style={styles.closeText}>Fechar</Text></Pressable></View>
   <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    {chapterNotes.length?<View style={styles.noteMenu}><Text style={styles.sectionTitle}>Notas deste capítulo</Text><View style={styles.noteChips}>{chapterNotes.map(note=><Pressable key={note.id} onPress={()=>setDraft(note)} style={[styles.noteChip,note.id===draft.id&&styles.noteChipActive]}><Text style={styles.noteChipText}>{note.pinned?"★ ":""}{note.title}</Text></Pressable>)}</View></View>:null}
    <View style={styles.titleRow}><TextInput value={draft.title} onChangeText={title=>touch({...draft,title})} placeholder="Título da nota" style={styles.titleInput}/><Pressable onPress={()=>touch({...draft,pinned:!draft.pinned})} style={[styles.pin,draft.pinned&&styles.pinActive]}><Text style={styles.pinText}>{draft.pinned?"★ Fixada":"☆ Fixar"}</Text></Pressable></View>
    {verse?<View style={styles.verseComments}><Text style={styles.sectionTitle}>Comentários em {reference}</Text>{draft.comments.filter(comment=>comment.anchorVerse===verse).map(comment=><View key={comment.id} style={styles.marginComment}><Text style={styles.marginLabel}>Ancorado ao versículo {verse}</Text><Text style={styles.marginText}>{comment.body}</Text><Pressable onPress={()=>touch({...draft,comments:draft.comments.filter(item=>item.id!==comment.id)})}><Text style={styles.remove}>Excluir</Text></Pressable></View>)}<TextInput value={verseCommentBody} onChangeText={setVerseCommentBody} multiline placeholder="Escreva um comentário ligado a este versículo" style={styles.commentInput}/><PrimaryButton variant="secondary" onPress={addVerseComment}>Adicionar ao versículo</PrimaryButton></View>:null}
    {draft.blocks.map(block=><View key={block.id} style={styles.block}>
     <View style={styles.blockTop}><Text style={styles.blockType}>{blockLabel[block.type]}</Text><Pressable onPress={()=>touch({...draft,blocks:draft.blocks.filter(item=>item.id!==block.id),comments:draft.comments.filter(item=>item.anchorBlockId!==block.id)})}><Text style={styles.remove}>Remover</Text></Pressable></View>
     {block.type==="passage"?<TextInput value={block.reference} onChangeText={next=>touch({...draft,blocks:draft.blocks.map(item=>item.id===block.id?{...item,reference:next,updatedAt:new Date().toISOString()}:item)})} placeholder="João 3:16" style={styles.referenceInput}/>:null}
     <TextInput value={block.content} onChangeText={value=>updateBlock(block.id,value)} multiline textAlignVertical="top" placeholder={block.type==="passage"?"Observação sobre a passagem":block.type==="table"?"Coluna 1 | Coluna 2":"Escreva aqui…"} style={[styles.blockInput,block.type==="heading"&&styles.headingInput,block.type==="quote"&&styles.quoteInput]}/>
     {draft.comments.filter(comment=>comment.anchorBlockId===block.id).map(comment=><View key={comment.id} style={styles.marginComment}><Text style={styles.marginLabel}>Comentário na margem</Text><Text style={styles.marginText}>{comment.body}</Text><Pressable onPress={()=>touch({...draft,comments:draft.comments.filter(item=>item.id!==comment.id)})}><Text style={styles.remove}>Excluir</Text></Pressable></View>)}
     {commentBlock===block.id?<View style={styles.commentComposer}><TextInput value={commentBody} onChangeText={setCommentBody} multiline placeholder="Comentário ancorado a este bloco" style={styles.commentInput}/><PrimaryButton variant="secondary" onPress={()=>addComment(block.id)}>Adicionar comentário</PrimaryButton></View>:<Pressable onPress={()=>{setCommentBlock(block.id);setCommentBody("");}}><Text style={styles.addComment}>＋ Comentário na margem</Text></Pressable>}
    </View>)}
    <View style={styles.composer}><Text style={styles.sectionTitle}>Novo bloco</Text>{verse?<PrimaryButton variant="secondary" onPress={()=>addBlock("passage")}>Inserir passagem {reference}</PrimaryButton>:null}<TextInput value={entry} onChangeText={setEntry} onSubmitEditing={submitEntry} placeholder='Digite texto ou "/" para escolher um bloco' style={styles.commandInput}/>
     {entry.startsWith("/")?<View style={styles.commands}>{COMMANDS.filter(item=>item.command.startsWith(entry.toLocaleLowerCase("pt-BR"))).map(item=><Pressable key={item.command} onPress={()=>addBlock(item.type)} style={styles.command}><Text style={styles.commandLabel}>{item.label}</Text><Text style={styles.commandCode}>{item.command}</Text></Pressable>)}</View>:null}
     <PrimaryButton variant="secondary" onPress={submitEntry}>Adicionar bloco</PrimaryButton>
    </View>
    {notice?<Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>:null}
    <PrimaryButton onPress={save}>Salvar nota</PrimaryButton>
    <PrimaryButton variant="text" onPress={()=>{onRemove(draft.id);setDraft(newNote(bookOsis,bookName,chapter,reference));setNotice("Nota removida.");}}>Excluir nota</PrimaryButton>
   </ScrollView>
  </View>
  </View>
 </Modal>;
}
const styles=StyleSheet.create({
 modalRoot:{flex:1,backgroundColor:"#f4f8fa"},modalRootWide:{alignItems:"flex-end",backgroundColor:"rgba(16,36,62,.22)"},page:{flex:1,width:"100%",backgroundColor:"#f4f8fa"},pageWide:{width:"54%",maxWidth:760,borderLeftWidth:1,borderLeftColor:colors.border,shadowColor:"#000",shadowOpacity:.18,shadowRadius:18,elevation:12},header:{flexDirection:"row",alignItems:"center",gap:spacing.md,padding:spacing.lg,paddingTop:spacing.xl,backgroundColor:colors.navy},headerText:{flex:1},eyebrow:{color:colors.gold,fontSize:11,fontWeight:"900",letterSpacing:1.2},reference:{color:colors.surface,fontSize:23,fontWeight:"900"},close:{minHeight:44,justifyContent:"center",paddingHorizontal:spacing.md,borderRadius:radius.full,backgroundColor:"#ffffff1f"},closeText:{color:colors.surface,fontWeight:"900"},content:{padding:spacing.lg,paddingBottom:spacing.xxl,gap:spacing.lg},
 noteMenu:{gap:spacing.sm},sectionTitle:{color:colors.navy,fontWeight:"900"},noteChips:{flexDirection:"row",flexWrap:"wrap",gap:spacing.sm},noteChip:{paddingHorizontal:spacing.md,paddingVertical:spacing.sm,borderRadius:radius.full,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},noteChipActive:{borderColor:colors.teal,backgroundColor:"#d8f2ee"},noteChipText:{color:colors.navy,fontWeight:"800"},
 titleRow:{flexDirection:"row",gap:spacing.sm},titleInput:{flex:1,minHeight:50,paddingHorizontal:spacing.md,borderRadius:radius.md,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,fontSize:18,fontWeight:"800"},pin:{minWidth:86,alignItems:"center",justifyContent:"center",borderRadius:radius.md,borderWidth:1,borderColor:colors.gold},pinActive:{backgroundColor:"#fff0a8"},pinText:{color:colors.goldDark,fontWeight:"900"},
 block:{gap:spacing.sm,padding:spacing.md,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},blockTop:{flexDirection:"row",justifyContent:"space-between"},blockType:{color:colors.tealDark,fontSize:11,fontWeight:"900",letterSpacing:.8},remove:{color:colors.error,fontSize:12,fontWeight:"800"},blockInput:{minHeight:96,color:colors.text,fontSize:16,lineHeight:24},headingInput:{fontSize:22,fontWeight:"900",color:colors.navy},quoteInput:{paddingLeft:spacing.md,borderLeftWidth:4,borderLeftColor:colors.gold,fontStyle:"italic"},referenceInput:{minHeight:44,paddingHorizontal:spacing.sm,borderRadius:radius.sm,backgroundColor:"#eef4f8",color:colors.tealDark,fontWeight:"900"},
 marginComment:{gap:4,marginLeft:spacing.lg,padding:spacing.sm,borderLeftWidth:3,borderLeftColor:colors.teal,backgroundColor:"#e8f7f4"},marginLabel:{color:colors.tealDark,fontSize:10,fontWeight:"900"},marginText:{color:colors.text,lineHeight:20},addComment:{color:colors.tealDark,fontSize:12,fontWeight:"900"},commentComposer:{gap:spacing.sm},commentInput:{minHeight:70,padding:spacing.sm,borderRadius:radius.sm,borderWidth:1,borderColor:colors.border},
 verseComments:{gap:spacing.sm,padding:spacing.md,borderRadius:radius.lg,borderWidth:1,borderColor:"#bfe9df",backgroundColor:"#f0fbf8"},composer:{gap:spacing.sm,padding:spacing.md,borderRadius:radius.lg,backgroundColor:"#e8f7f4"},commandInput:{minHeight:48,paddingHorizontal:spacing.md,borderRadius:radius.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border},commands:{gap:spacing.xs},command:{flexDirection:"row",justifyContent:"space-between",padding:spacing.sm,borderRadius:radius.sm,backgroundColor:colors.surface},commandLabel:{color:colors.navy,fontWeight:"800"},commandCode:{color:colors.muted},notice:{padding:spacing.md,borderRadius:radius.md,backgroundColor:"#d9f2df",color:colors.tealDark,fontWeight:"800"}
});
