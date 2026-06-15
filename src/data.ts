export interface Student {
  id: number;           // 出席番号
  name: string;         // 名前 (漢字等)
  kana: string;         // かな (ひらがな)
  birthMonth: number;   // 誕生月
  birthDay: number;     // 誕生日
  smileId: string;      // スマイルネクストID
  password: string;     // パスワード
}

export const STUDENTS_DATA: Student[] = [
  { id: 1, name: "阿佐美　桜", kana: "あざみ　さくら", birthMonth: 2, birthDay: 17, smileId: "23077", password: "111111" },
  { id: 2, name: "阿部　渚煌", kana: "あべ　なつき", birthMonth: 7, birthDay: 11, smileId: "23002", password: "111111" },
  { id: 3, name: "池田　蘭奈", kana: "いけだ　らんな", birthMonth: 6, birthDay: 18, smileId: "23052", password: "111111" },
  { id: 4, name: "井　健翔", kana: "いまい　けんと", birthMonth: 9, birthDay: 7, smileId: "23080", password: "111111" },
  { id: 5, name: "牛山　結愛", kana: "うしやま　ゆいな", birthMonth: 11, birthDay: 10, smileId: "23081", password: "111111" },
  { id: 6, name: "大竹　想", kana: "おおたけ　そう", birthMonth: 12, birthDay: 9, smileId: "23130", password: "111111" },
  { id: 7, name: "小柏　翔琉", kana: "おがしわ　かける", birthMonth: 8, birthDay: 19, smileId: "23008", password: "111111" },
  { id: 8, name: "押田　つむぎ", kana: "おしだ　つむぎ", birthMonth: 12, birthDay: 3, smileId: "23106", password: "111111" },
  { id: 9, name: "川島　愛咲", kana: "かわしま　あみ", birthMonth: 7, birthDay: 17, smileId: "23058", password: "111111" },
  { id: 10, name: "栗原　希乃羽", kana: "くりばら　ののは", birthMonth: 6, birthDay: 5, smileId: "23086", password: "111111" },
  { id: 11, name: "小島　快斗", kana: "こじま　かいと", birthMonth: 1, birthDay: 26, smileId: "23089", password: "111111" },
  { id: 12, name: "須藤　來愛", kana: "すとう　くれあ", birthMonth: 2, birthDay: 27, smileId: "23114", password: "111111" },
  { id: 13, name: "束田　千花", kana: "つかだ　ちか", birthMonth: 8, birthDay: 30, smileId: "23116", password: "111111" },
  { id: 14, name: "土屋　柊奈", kana: "つちや　ひな", birthMonth: 3, birthDay: 6, smileId: "23095", password: "111111" },
  { id: 15, name: "堤　陽香", kana: "つつみ　はるか", birthMonth: 6, birthDay: 15, smileId: "23016", password: "111111" },
  { id: 16, name: "富沢　悦那", kana: "とみざわ　えつな", birthMonth: 8, birthDay: 29, smileId: "23066", password: "111111" },
  { id: 17, name: "豊田　美怜", kana: "とよだ　みれい", birthMonth: 4, birthDay: 29, smileId: "23040", password: "111111" },
  { id: 18, name: "長嶋　優月", kana: "ながしま　ゆづき", birthMonth: 9, birthDay: 10, smileId: "23096", password: "111111" },
  { id: 19, name: "長沼　幸弥", kana: "ながぬま　ゆきや", birthMonth: 8, birthDay: 19, smileId: "23119", password: "111111" },
  { id: 20, name: "中野　健", kana: "なかの　たける", birthMonth: 5, birthDay: 17, smileId: "23042", password: "111111" },
  { id: 21, name: "沼守　優月", kana: "ぬまもり　ゆづき", birthMonth: 5, birthDay: 16, smileId: "23068", password: "111111" },
  { id: 22, name: "萩原　大地", kana: "はぎわら　だいち", birthMonth: 6, birthDay: 10, smileId: "23070", password: "111111" },
  { id: 23, name: "橋本　つき", kana: "はしもと　つき", birthMonth: 10, birthDay: 4, smileId: "23021", password: "111111" },
  { id: 24, name: "前原　葵", kana: "まえはら　あおい", birthMonth: 6, birthDay: 4, smileId: "23120", password: "111111" },
  { id: 25, name: "松尾　穂", kana: "まつお　みのり", birthMonth: 10, birthDay: 16, smileId: "23121", password: "111111" },
  { id: 26, name: "三鼓　絵美", kana: "みつづみ　えみ", birthMonth: 9, birthDay: 9, smileId: "23122", password: "111111" },
  { id: 27, name: "三輪　朔稔", kana: "みわ　さくなり", birthMonth: 8, birthDay: 5, smileId: "23125", password: "111111" },
  { id: 28, name: "柳井　葵音", kana: "やなぎい　あおと", birthMonth: 8, birthDay: 9, smileId: "23047", password: "111111" },
  { id: 29, name: "山岸　新", kana: "やまぎし　あらた", birthMonth: 6, birthDay: 21, smileId: "23048", password: "111111" },
  { id: 30, name: "山﨑　梛菜美", kana: "やまざき　ななみ", birthMonth: 3, birthDay: 10, smileId: "23049", password: "111111" },
  { id: 31, name: "渡邉　竣太", kana: "わたなべ　しゅんた", birthMonth: 8, birthDay: 21, smileId: "23102", password: "111111" }
];
