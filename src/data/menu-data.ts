export interface Menu {
  date: string; // "2日(月)"
  day: number;  // 2
  lunch: string;
  snack: string;
  calories: string;
}

export const februaryMenu: Menu[] = [
  { day: 2, date: "2日(月)", lunch: "鮭の塩こうじ漬け、はくさいと油揚げの煮浸し、みそ汁", snack: "マカロニきなこ", calories: "494 kcal" },
  { day: 3, date: "3日(火)", lunch: "鶏そぼろ丼、和風ポテトサラダ、みそ汁", snack: "バナナパウンドケーキ", calories: "474 kcal" },
  { day: 4, date: "4日(水)", lunch: "たれカツ丼、ブロッコリーのごま和え、みそ汁", snack: "お麩ラスク(シュガー)", calories: "463 kcal" },
  { day: 5, date: "5日(木)", lunch: "生揚げとチンゲン菜のとろみ煮、かぼちゃの甘辛焼き、みそ汁", snack: "いちご豆乳寒天、いりこ", calories: "481 kcal" },
  { day: 6, date: "6日(金)", lunch: "食パン、鶏のトマト煮、コールスロー、コンソメスープ", snack: "彩り納豆チャーハン、マスカットゼリー", calories: "449 kcal" },
  { day: 7, date: "7日(土)", lunch: "ビビンパ丼、蒸かし芋、みそ汁", snack: "豆乳ヨーグルト", calories: "462 kcal" },
  { day: 9, date: "9日(月)", lunch: "バーベキューチキン、マッシュ里芋、みそ汁", snack: "トマトチーズマフィン", calories: "449 kcal" },
  { day: 10, date: "10日(火)", lunch: "豚のあんかけ焼きそば、ブロッコリーのサラダ、みそ汁", snack: "小魚とわかめのごはん", calories: "482 kcal" },
  { day: 12, date: "12日(木)", lunch: "さわらの竜田揚げ、白和え、みそ汁", snack: "中華風ビーフン", calories: "456 kcal" },
  { day: 13, date: "13日(金)", lunch: "ハヤシライス、かぼちゃサラダ、コンソメスープ", snack: "コーンフレークおこし", calories: "501 kcal" },
  { day: 14, date: "14日(土)", lunch: "豚そぼろとキャベツのチャーハン、煮物、中華スープ", snack: "いももち(さつまいも)", calories: "475 kcal" },
  { day: 16, date: "16日(月)", lunch: "鮭の塩こうじ漬け、はくさいと油揚げの煮浸し、みそ汁", snack: "マカロニきなこ", calories: "451 kcal" },
  { day: 17, date: "17日(火)", lunch: "豚とパプリカの和風炒め、味噌ポテト、すまし汁", snack: "ハムと野菜の醤油ラーメン", calories: "461 kcal" },
  { day: 18, date: "18日(水)", lunch: "たれカツ丼、ブロッコリーのごま和え、みそ汁", snack: "お麩ラスク(シュガー)", calories: "463 kcal" },
  { day: 19, date: "19日(木)", lunch: "生揚げとチンゲン菜のとろみ煮、かぼちゃの甘辛焼き、みそ汁", snack: "いちご豆乳寒天、いりこ", calories: "481 kcal" },
  { day: 20, date: "20日(金)", lunch: "食パン、鶏のトマト煮、コールスロー、コンソメスープ", snack: "彩り納豆チャーハン、マスカットゼリー", calories: "449 kcal" },
  { day: 21, date: "21日(土)", lunch: "ビビンパ丼、蒸かし芋、みそ汁", snack: "豆乳ヨーグルト", calories: "462 kcal" },
  { day: 24, date: "24日(火)", lunch: "豚のあんかけ焼きそば、ブロッコリーのサラダ、みそ汁", snack: "小魚とわかめのごはん", calories: "482 kcal" },
  { day: 25, date: "25日(水)", lunch: "鶏とほうれん草のクリーム煮、甘酢和え、みそ汁", snack: "ごまきなこトースト", calories: "462 kcal" },
  { day: 26, date: "26日(木)", lunch: "さわらの竜田揚げ、白和え、みそ汁", snack: "中華風ビーフン", calories: "456 kcal" },
  { day: 27, date: "27日(金)", lunch: "ハヤシライス、かぼちゃサラダ、コンソメスープ", snack: "ほうれんそうとコーンのケーキ", calories: "499 kcal" },
  { day: 28, date: "28日(土)", lunch: "豚そぼろとキャベツのチャーハン、煮物、中華スープ", snack: "いももち(さつまいも)", calories: "475 kcal" },
  // Test Data for Jan 29
  { day: 29, date: "29日(木)", lunch: "【テスト】カレーライス、サラダ", snack: "【テスト】プリン", calories: "500 kcal" },
];

/**
 * Gets the menu for a specific date.
 * Returns the menu item matching the day of the month.
 */
export const getMenuForDate = (date: Date): Menu | undefined => {
  const day = date.getDate();
  return februaryMenu.find(m => m.day === day);
};
