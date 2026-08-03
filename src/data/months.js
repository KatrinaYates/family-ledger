export const months = [
  {id:'july',short:'JULY',label:'July',number:'01',status:'active',icon:'☀',season:'Sunshine Edition',sticker:'🌻',colors:['#F6C85F','#F4A261','#E97C6C']},
  {id:'august',short:'AUG',label:'August',number:'02',status:'locked',sticker:'🌺',colors:['#F5B16F','#E98A67','#CC6F72'],message:'The garden is still growing.',promise:'We’ll open it together in August.',preview:['Garden goals.','Warm-weather wins.','Gentle course corrections.']},
  {id:'september',short:'SEP',label:'September',number:'03',status:'locked',sticker:'✏️',colors:['#B8C96A','#8EAA51','#6D8B45'],message:'A fresh-start chapter is waiting.',promise:'Meet us here in September.',preview:['Reset routines.','Refocus goals.','Keep what works.']},
  {id:'october',short:'OCT',label:'October',number:'04',status:'locked',sticker:'🍂',colors:['#D98A5F','#B95F43','#8E4638'],message:'This cozy chapter is still steeping.',promise:'October will be here soon.',preview:['Cozy choices.','Intentional spending.','Warm little wins.']},
  {id:'november',short:'NOV',label:'November',number:'05',status:'locked',sticker:'🌾',colors:['#A99573','#7F6B52','#5C4D3D'],message:'A gratitude-filled chapter is waiting.',promise:'We’ll open it together in November.',preview:['Notice abundance.','Plan with care.','Celebrate enough.']},
  {id:'december',short:'DEC',label:'December',number:'06',status:'locked',sticker:'✨',colors:['#4F9A86','#2E7568','#25584F'],message:'The final chapter is saving a little magic.',promise:'December will close the year beautifully.',preview:['Reflect on progress.','Celebrate the year.','Dream forward.']},
];

export const createBlankMonth = () => ({monthStory:'',futureUs:'',decisions:[],actions:[]});
