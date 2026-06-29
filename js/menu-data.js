const MENU_DATA = [
  {
    "id": "forretter",
    "name_da": "Forretter",
    "name_zh": "前菜",
    "discount": true,
    "items": [
      {
        "code": "F1",
        "id": "forretter_1",
        "name_da": "Snackkurv (til 2 personer)",
        "name_zh": "前餐拼盘",
        "description_da": "2 personer, inkl. 4 mini forårsruller, 4 tempura rejer, 4 dybstegte kyllingedumplings, rejechips",
        "price": 128,
        "description_zh": "2人份，包含4个迷你春卷、4个天妇罗虾、4个鸡肉炸饺、虾片"
      },
      {
        "code": "F2",
        "id": "forretter_2",
        "name_da": "Mini forårsruller 6stk.",
        "name_zh": "小春卷6个",
        "description_da": "Vegetar",
        "price": 48,
        "image": "images/forretter_1.jpg",
        "description_zh": "素食"
      },
      {
        "code": "F3",
        "id": "forretter_3",
        "name_da": "Hjemmelavede forårsruller med oksekød 4 stk.",
        "name_zh": "牛肉春卷4个",
        "description_da": "Fyldt med hakket oksekød og kinakål",
        "price": 58,
        "image": "images/forretter_2.jpg",
        "description_zh": "馅料为碎牛肉和圆白菜"
      },
      {
        "code": "F4",
        "id": "forretter_4",
        "name_da": "Hjemmelavede forårsruller med and 3 stk.",
        "name_zh": "鸭春卷3个",
        "description_da": "Fyldt med hakket and og kinakål",
        "price": 58,
        "image": "images/forretter_3.png",
        "description_zh": "馅料为碎鸭肉和圆白菜"
      },
      {
        "code": "F5",
        "id": "forretter_5",
        "name_da": "Dybstegte Tempura Rejer 4stk.",
        "name_zh": "日本炸虾4个",
        "description_da": "",
        "price": 58,
        "image": "images/forretter_4.webp"
      },
      {
        "code": "F6",
        "id": "forretter_6",
        "name_da": "Kyllinge nuggets 6 stk",
        "name_zh": "炸鸡块6块",
        "description_da": "",
        "price": 58,
        "image": "images/forretter_5.jpg"
      },
      {
        "code": "F7",
        "id": "forretter_7",
        "name_da": "Dybstegte dumplings med kylling 5stk",
        "name_zh": "炸鸡肉饺子5个",
        "description_da": "",
        "price": 58,
        "image": "images/forretter_6.png"
      },
      {
        "code": "F8",
        "id": "forretter_8",
        "name_da": "Hjemmelavede dumplings i chiliolie",
        "name_zh": "红油水饺4个",
        "description_da": "Fyldt med hakket svinekød og purløg, stærkt krydret",
        "price": 58,
        "image": "images/forretter_7.jpg",
        "description_zh": "馅料为碎猪肉和韭菜，辣味"
      },
      {
        "code": "F9",
        "id": "forretter_9",
        "name_da": "Kogte Harbin-dumplings 10stk.",
        "name_zh": "东北水饺10个",
        "description_da": "Fyldt med hakket svinekød og purløg",
        "price": 128,
        "image": "images/forretter_8.jpg",
        "description_zh": "馅料为碎猪肉和韭菜"
      },
      {
        "code": "F10",
        "id": "forretter_10",
        "name_da": "Rejer Chips",
        "name_zh": "虾片",
        "description_da": "",
        "price": 18,
        "image": "images/forretter_10.jpg"
      }
    ]
  },
  {
    "id": "dagens_suppe",
    "name_da": "Dagens Suppe",
    "name_zh": "餐前汤",
    "discount": true,
    "items": [
      {
        "code": "S1",
        "id": "suppe_1",
        "name_da": "Peking suppe",
        "name_zh": "北京汤",
        "description_da": "Med and, bambusskud og vandkastanjer. Smag: sur, sød og stærk",
        "price": 58,
        "image": "images/suppe_1.jpg",
        "description_zh": "配料：鸭肉、竹笋、荸荠；口味：酸、甜、辣"
      },
      {
        "code": "S2",
        "id": "suppe_2",
        "name_da": "Kylling suppe",
        "name_zh": "鸡丝汤",
        "description_da": "Med strimlet kylling og svampe",
        "price": 58,
        "image": "images/suppe_2.jpg",
        "description_zh": "配料：鸡丝、蘑菇"
      },
      {
        "code": "S3",
        "id": "suppe_3",
        "name_da": "Wonton suppe",
        "name_zh": "云吞汤",
        "description_da": "Fyld: Svinekød",
        "price": 58,
        "image": "images/suppe_3.jpg",
        "description_zh": "馅料：猪肉"
      },
      {
        "code": "S4",
        "id": "suppe_4",
        "name_da": "Majssuppe med kylling stykker",
        "name_zh": "鸡蛋玉米羹",
        "description_da": "Med majs og strimlet kylling",
        "price": 58,
        "image": "images/suppe_4.jpg",
        "description_zh": "配料：玉米、鸡肉条"
      }
    ]
  },
  {
    "id": "dum",
    "name_da": "Dum",
    "name_zh": "点心",
    "discount": true,
    "items": [
      {
        "code": "D1",
        "id": "dum_1",
        "name_da": "Char Siu Bao 3stk.",
        "name_zh": "叉烧包3个",
        "description_da": "Dampede boller med sødt grillet svinekød",
        "price": 58,
        "image": "images/dum_1.jpg",
        "description_zh": "内馅为甜口烧烤猪肉的包子"
      },
      {
        "code": "D2",
        "id": "dum_2",
        "name_da": "Siu Mai 4stk.",
        "name_zh": "烧卖4个",
        "description_da": "Dampede dumplings med svinekød og svampe",
        "price": 58,
        "image": "images/dum_2.png",
        "description_zh": "猪肉和蘑菇馅的蒸饺"
      },
      {
        "code": "D3",
        "id": "dum_3",
        "name_da": "Har Gow 4stk.",
        "name_zh": "虾饺4个",
        "description_da": "Dampede dumplings med rejer og bambusskud",
        "price": 58,
        "image": "images/dum_3.png",
        "description_zh": "虾和竹笋馅的蒸饺"
      },
      {
        "code": "D4",
        "id": "dum_4",
        "name_da": "Sesamboller 5stk.",
        "name_zh": "芝麻球5个",
        "description_da": "Friturestegte kugler af klistret ris med sesam, fyldt med rød bønner",
        "price": 58,
        "image": "images/dum_4.jpg",
        "description_zh": "裹芝麻的糯米油炸球，内馅为红豆"
      }
    ]
  },
  {
    "id": "kold_rette",
    "name_da": "Kold Rette",
    "name_zh": "冷盘",
    "discount": true,
    "items": [
      {
        "code": "K1",
        "id": "kold_1",
        "name_da": "Special edamame",
        "name_zh": "醉香毛豆",
        "description_da": "Edamame tilberedt med speciel kinesisk spiritus",
        "price": 38,
        "image": "images/kold_1.jpg",
        "description_zh": "毛豆用特制中国酒烹制"
      },
      {
        "code": "K2",
        "id": "kold_2",
        "name_da": "Kimchi kinakål",
        "name_zh": "辣白菜",
        "description_da": "Stærkt krydret kinakål",
        "price": 58,
        "image": "images/kold_2.jpg",
        "description_zh": "辣味，中国圆白菜"
      },
      {
        "code": "K3",
        "id": "kold_3",
        "name_da": "Agurk strimler med citron sauce",
        "name_zh": "柠檬黄瓜条",
        "description_da": "Agurk",
        "price": 58,
        "image": "images/kold_3.jpg",
        "description_zh": "黄瓜"
      },
      {
        "code": "K4",
        "id": "kold_4",
        "name_da": "Fuqi Feipian",
        "name_zh": "夫妻肺片",
        "description_da": "Tyndtskåret oksemave, tunge, hjerte og nakkekød med koriander og forårsløg",
        "price": 148,
        "image": "images/kold_4.jpg",
        "description_zh": "薄切牛肺、舌头、心和颈肉，配香菜和青葱"
      },
      {
        "code": "K5",
        "id": "kold_5",
        "name_da": "Oksemave salad i chilioil",
        "name_zh": "红油牛肚",
        "description_da": "",
        "price": 148,
        "image": "images/kold_5.jpg"
      },
      {
        "code": "K6",
        "id": "kold_6",
        "name_da": "Okse-tripe salat i chili sauce",
        "name_zh": "凉拌牛百叶",
        "description_da": "",
        "price": 148,
        "image": "images/kold_6.jpg"
      }
    ]
  },
  {
    "id": "hovedretter_kylling",
    "name_da": "Hovedretter - Kylling",
    "name_zh": "主菜 - 鸡肉",
    "discount": true,
    "items": [
      {
        "code": "H1",
        "id": "h_kylling_1",
        "name_da": "Dry wok med kylling",
        "name_zh": "干锅鸡",
        "description_da": "Wokstegt kylling med selleri, svampe, rød og grøn peberfrugt",
        "price": 168,
        "image": "images/h_kylling_1.jpg",
        "description_zh": "干炒鸡肉，搭配香芹、蘑菇、红彩椒和绿彩椒"
      },
      {
        "code": "H2",
        "id": "h_kylling_2",
        "name_da": "Gong Bao Kylling",
        "name_zh": "宫保鸡丁",
        "description_da": "Friturestegte kyllingebidder med jordnødder og tørret chili, sød-syrlig og let stærk",
        "price": 168,
        "image": "images/h_kylling_2.jpg",
        "description_zh": "油炸鸡丁，搭配花生和干辣椒，口味酸甜带微辣"
      },
      {
        "code": "H3",
        "id": "h_kylling_3",
        "name_da": "Kylling i sur sød sauce",
        "name_zh": "甜酸鸡",
        "description_da": "Kylling, peberfrugt og ananas i sød-syrlig sauce",
        "price": 168,
        "description_zh": "鸡肉、彩椒和菠萝搭配甜酸酱汁"
      },
      {
        "code": "H4",
        "id": "h_kylling_4",
        "name_da": "Kylling a la Harbin",
        "name_zh": "哈尔滨辣子鸡",
        "description_da": "Krydret og aromatisk, kyllingebryst med tørret chili",
        "price": 168,
        "image": "images/h_kylling_4.jpg",
        "description_zh": "辛辣芳香，选用鸡腿肉搭配干辣椒"
      },
      {
        "code": "H5",
        "id": "h_kylling_5",
        "name_da": "Lynstegt kylling i østerssauce",
        "name_zh": "蚝油鸡片",
        "description_da": "Lynstegt kylling i østerssauce med sæsongrøntsager",
        "price": 168,
        "image": "images/h_kylling_5.jpg",
        "description_zh": "快炒鸡肉搭配蚝油和时令蔬菜"
      },
      {
        "code": "H6",
        "id": "h_kylling_6",
        "name_da": "Kylling i rød Karry",
        "name_zh": "红咖喱鸡",
        "description_da": "Stærkt og cremet, med kylling, rød karry, kokosmælk, broccoli og peberfrugt",
        "price": 168,
        "image": "images/h_kylling_6.jpg",
        "description_zh": "辛辣顺滑，包含鸡肉、红咖喱、椰奶、西兰花、彩椒"
      }
    ]
  },
  {
    "id": "hovedretter_oksekoed",
    "name_da": "Hovedretter - Oksekød",
    "name_zh": "主菜 - 牛肉",
    "discount": true,
    "items": [
      {
        "code": "H7",
        "id": "h_okse_1",
        "name_da": "Dry wok med oksekød",
        "name_zh": "干锅牛肉",
        "description_da": "Wokstegt oksekød med selleri, svampe, rød og grøn peberfrugt",
        "price": 188,
        "image": "images/h_okse_1.jpg",
        "description_zh": "干炒牛肉配芹菜、蘑菇、红绿甜椒"
      },
      {
        "code": "H8",
        "id": "h_okse_2",
        "name_da": "Oksekød i sort peber sauce på jernfad",
        "name_zh": "铁板黑椒牛肉",
        "description_da": "Wokstegt oksekød, peberfrugt, løg i sort pebersauce, serveret på jernfad",
        "price": 188,
        "description_zh": "炒牛肉、甜椒、洋葱，搭配黑椒酱，铁板盛装"
      },
      {
        "code": "H9",
        "id": "h_okse_3",
        "name_da": "Braiseret oksekød",
        "name_zh": "红烧牛肉",
        "description_da": "Wokstegt oksekød med kartoffel, fyldig og salt smag",
        "price": 188,
        "image": "images/h_okse_3.jpg",
        "description_zh": "炒牛肉配土豆，口味浓郁偏咸"
      },
      {
        "code": "H10",
        "id": "h_okse_4",
        "name_da": "Oksekød i gylden suppe",
        "name_zh": "金汤肥牛",
        "description_da": "Oksekød i gylden bouillon med agurk, broccoli og enokisvamp",
        "price": 208,
        "image": "images/h_okse_4.jpg",
        "description_zh": "牛肉裹在金汤底中，搭配黄瓜、西兰花、金针菇"
      },
      {
        "code": "H11",
        "id": "h_okse_5",
        "name_da": "Oksekød i stærk Szechuan-sauce",
        "name_zh": "水煮牛肉",
        "description_da": "Kogt oksekød med kinakål, overhældt med speciel Szechuan chilisauce",
        "price": 188,
        "image": "images/h_okse_5.jpg",
        "description_zh": "熟牛肉配大白菜，浇淋特制川味辣酱"
      },
      {
        "code": "H12",
        "id": "h_okse_6",
        "name_da": "Oksekød med to slags chili",
        "name_zh": "双椒牛肉",
        "description_da": "Wokstegt oksekødsstrimler med frisk chili og forårsløg",
        "price": 188,
        "image": "images/h_okse_6.jpg",
        "description_zh": "炒牛肉条搭配新鲜辣椒、葱"
      },
      {
        "code": "H13",
        "id": "h_okse_7",
        "name_da": "Oksekød i østerssauce",
        "name_zh": "蚝油牛肉",
        "description_da": "Wokstegt oksekød med peberfrugt og løg i østerssauce",
        "price": 188,
        "image": "images/h_okse_7.jpg",
        "description_zh": "炒牛肉配甜椒、洋葱，淋蚝油汁"
      },
      {
        "code": "H14",
        "id": "h_okse_8",
        "name_da": "Oksekød i rød karry",
        "name_zh": "红咖喱牛肉",
        "description_da": "Rød karry med kokosmælk, broccoli, peberfrugt og oksekød",
        "price": 198,
        "image": "images/h_okse_8.jpg",
        "description_zh": "红咖喱汤底配椰奶、西兰花、甜椒，搭配牛肉"
      }
    ]
  },
  {
    "id": "hovedretter_svinekoed",
    "name_da": "Hovedretter - Svinekød",
    "name_zh": "主菜 - 猪肉",
    "discount": true,
    "items": [
      {
        "code": "H15",
        "id": "h_svine_1",
        "name_da": "Dry wok med Spareribs",
        "name_zh": "干锅排骨",
        "description_da": "Wokstegt spareribs med selleri, svampe, rød og grøn peberfrugt",
        "price": 188,
        "image": "images/h_svine_1.jpg",
        "description_zh": "干煎猪肉，搭配芹菜、蘑菇、红甜椒和绿甜椒"
      },
      {
        "code": "H16",
        "id": "h_svine_2",
        "name_da": "Dry wok med Svinetarm",
        "name_zh": "干锅肥肠",
        "description_da": "Wokstegt svinetarm med selleri, svampe, rød og grøn peberfrugt",
        "price": 188,
        "image": "images/h_svine_2.jpg",
        "description_zh": "干煎猪肠，搭配芹菜、蘑菇、红甜椒和绿甜椒"
      },
      {
        "code": "H17",
        "id": "h_svine_3",
        "name_da": "Guo Bao med svinekød",
        "name_zh": "锅包肉",
        "description_da": "Friturestegt sprødt svinekød i sød-syrlig sauce",
        "price": 188,
        "image": "images/h_svine_3.jpg",
        "description_zh": "炸至酥脆的猪肉裹糖醋酱"
      },
      {
        "code": "H18",
        "id": "h_svine_4",
        "name_da": "Svinekød i sur sød sauce",
        "name_zh": "菠萝咕咾肉",
        "description_da": "Friturestegt svinekød med ananas og grøn peberfrugt i sød-syrlig sauce",
        "price": 188,
        "image": "images/h_svine_4.jpg",
        "description_zh": "炸猪肉搭配新鲜菠萝、绿甜椒，裹糖醋酱"
      },
      {
        "code": "H19",
        "id": "h_svine_5",
        "name_da": "Yuxiang svinekød",
        "name_zh": "鱼香肉丝",
        "description_da": "Wokstegt svinekød med trøffel, bambusskud og grøn peberfrugt i sød-syrlig sauce",
        "price": 188,
        "image": "images/h_svine_5.jpg",
        "description_zh": "炒猪肉搭配木耳、竹笋、绿甜椒，淋糖醋酱"
      },
      {
        "code": "H20",
        "id": "h_svine_6",
        "name_da": "Harbin-style dobbeltstegt svinekød",
        "name_zh": "哈香回锅肉",
        "description_da": "Wokstegt svinebryst med grøn peberfrugt og løg",
        "price": 188,
        "image": "images/h_svine_6.jpg",
        "description_zh": "炒猪肉胸肉搭配绿甜椒和洋葱"
      },
      {
        "code": "H21",
        "id": "h_svine_7",
        "name_da": "Sprødt fristurestegt svinekød",
        "name_zh": "溜肉段",
        "description_da": "Friturestegte svinekødsbidder med grøn peberfrugt",
        "price": 178,
        "image": "images/h_svine_7.jpg",
        "description_zh": "炸猪肉块搭配绿甜椒"
      },
      {
        "code": "H23",
        "id": "h_svine_9",
        "name_da": "Harbin-style braiseret svinekød",
        "name_zh": "哈尔滨坛子红烧肉+鹌鹑蛋",
        "description_da": "Braiseret svinekød med vagtelæg, shaoxingvin og sojasauce",
        "price": 198,
        "image": "images/h_svine_9.jpg",
        "description_zh": "炖猪肉搭配鹌鹑蛋，加入绍兴酒和酱油"
      },
      {
        "code": "H24",
        "id": "h_svine_10",
        "name_da": "Máo Xûe Wàng",
        "name_zh": "毛血旺",
        "description_da": "Klassisk Szechuan hotpot med andeblod, oksemave og grøntsager",
        "price": 258,
        "image": "images/h_svine_10.jpg",
        "description_zh": "经典四川辣锅，搭配鸭血、牛肚和蔬菜"
      }
    ]
  },
  {
    "id": "hovedretter_lammekoed",
    "name_da": "Hovedretter - Lammekød",
    "name_zh": "主菜 - 羊肉",
    "discount": true,
    "items": [
      {
        "code": "H25",
        "id": "h_lam_1",
        "name_da": "Lammekød med spidskommen",
        "name_zh": "孜然羊肉",
        "description_da": "Stegt lam med spidskommen, løg, koriander og chili",
        "price": 198,
        "image": "images/h_lam_1.jpg",
        "description_zh": "烤羊肉搭配孜然、洋葱、香菜和辣椒"
      },
      {
        "code": "H26",
        "id": "h_lam_2",
        "name_da": "Hu Nan Lam",
        "name_zh": "湘西羊肉",
        "description_da": "Lam med selleri, koriander og tørret chili",
        "price": 198,
        "description_zh": "羊肉搭配芹菜、香菜和干辣椒"
      },
      {
        "code": "H27",
        "id": "h_lam_3",
        "name_da": "Lynstegt lam med forårsløg",
        "name_zh": "葱爆羊肉",
        "description_da": "Lynstegt lam med forårsløg og koriander",
        "price": 198,
        "image": "images/h_lam_3.jpg",
        "description_zh": "爆炒羊肉搭配葱和香菜"
      }
    ]
  },
  {
    "id": "hovedretter_and",
    "name_da": "Hovedretter - And",
    "name_zh": "主菜 - 鸭肉",
    "discount": true,
    "items": [
      {
        "code": "H28",
        "id": "h_and_1",
        "name_da": "Dry Pot Boneless Duck",
        "name_zh": "干锅去骨鸭",
        "description_da": "Salt og aromatisk, med and, selleri, svampe og peberfrugt",
        "price": 188,
        "image": "images/h_and_1.jpg",
        "description_zh": "口味偏咸香，包含鸭肉、芹菜、蘑菇、甜椒"
      },
      {
        "code": "H29",
        "id": "h_and_2",
        "name_da": "Yuiang-sauce på jernpande",
        "name_zh": "鱼香铁板鸭",
        "description_da": "Jernpande-stegt and med grøntsager i sød-syrlig Yuxiang-sauce",
        "price": 188,
        "description_zh": "铁板煎鸭肉搭配蔬菜，淋上酸甜微辣的鱼香酱汁"
      },
      {
        "code": "H30",
        "id": "h_and_3",
        "name_da": "Sprødstegt and",
        "name_zh": "香酥鸭",
        "description_da": "Sprødstegt and med løg- og svampesauce",
        "price": 178,
        "image": "images/h_and_3.jpg",
        "description_zh": "外皮酥脆的炸鸭肉，搭配洋葱蘑菇酱汁"
      }
    ]
  },
  {
    "id": "hovedretter_rejer",
    "name_da": "Hovedretter - Rejer",
    "name_zh": "主菜 - 虾类",
    "discount": true,
    "items": [
      {
        "code": "H31",
        "id": "h_rejer_1",
        "name_da": "Wokstegte rejer med skal",
        "name_zh": "干锅大虾（有壳）",
        "description_da": "Wokstegte rejer med skal, selleri, svampe, rød og grøn peberfrugt",
        "price": 198,
        "image": "images/h_rejer_1.jpg",
        "description_zh": "干锅炒大虾，搭配芹菜、蘑菇、红彩椒和绿彩椒"
      },
      {
        "code": "H32",
        "id": "h_rejer_2",
        "name_da": "Sprødstegte te-rejer med skal",
        "name_zh": "茶香虾（有壳）",
        "description_da": "Friturestegte rejer med skal og teblade",
        "price": 198,
        "image": "images/h_rejer_2.jpg",
        "description_zh": "带壳大虾油炸，搭配茶叶"
      },
      {
        "code": "H33",
        "id": "h_rejer_3",
        "name_da": "Stærk og krydret rejer med skal",
        "name_zh": "香辣一品虾（有壳）",
        "description_da": "Rejer med skal i stærk chilisauce",
        "price": 198,
        "description_zh": "带壳大虾用重辣酱汁炒制"
      },
      {
        "code": "H35",
        "id": "h_rejer_5",
        "name_da": "Rejer i rød karry",
        "name_zh": "咖喱虾",
        "description_da": "Pilte rejer med svampe i rød karrysauce",
        "price": 198,
        "image": "images/h_rejer_5.jpg",
        "description_zh": "手剥虾仁搭配蘑菇，用红咖喱酱汁烹制"
      }
    ]
  },
  {
    "id": "hovedretter_fisk",
    "name_da": "Hovedretter - Fisk",
    "name_zh": "主菜 - 鱼类",
    "discount": true,
    "items": [
      {
        "code": "H36",
        "id": "h_fisk_1",
        "name_da": "Harbin grillet fisk (hel fisk med ben)",
        "name_zh": "哈尔滨烤鱼（有骨）",
        "description_da": "Hel fisk med ben, grillet med kyllingebouillon, agurk, lotusrod og tofu",
        "price": 288,
        "image": "images/h_fisk_1.jpg",
        "description_zh": "整条带骨烤鱼，搭配鸡汤、黄瓜、莲藕和豆腐"
      },
      {
        "code": "H37",
        "id": "h_fisk_2",
        "name_da": "Chongqing-stil fiskefilet i sennepkålssuppe (uden ben)",
        "name_zh": "重庆酸菜鱼（无骨）",
        "description_da": "Kogte fiskefiletter uden ben i syrlig sennepskålsbouillon",
        "price": 228,
        "image": "images/h_fisk_2.jpg",
        "description_zh": "无骨煮鱼片，搭配发酵酸菜酸汤"
      },
      {
        "code": "H38",
        "id": "h_fisk_3",
        "name_da": "Sichuan-stil pocheret fisk (uden ben)",
        "name_zh": "沸腾鱼（无骨）",
        "description_da": "Kogte fiskefiletter uden ben med bønnespirer og kinakål, overhældt med chiliolie",
        "price": 238,
        "image": "images/h_fisk_3.jpg",
        "description_zh": "无骨煮鱼片，搭配豆芽和白菜，淋入香辣红油"
      },
      {
        "code": "H39",
        "id": "h_fisk_4",
        "name_da": "Fiskefilet i gylden suppe (uden ben)",
        "name_zh": "金汤鱼片（无骨）",
        "description_da": "Fiskefiletter uden ben med broccoli, agurk og enokisvamp i gylden bouillon",
        "price": 238,
        "image": "images/h_fisk_4.jpg",
        "description_zh": "无骨鱼片，搭配西兰花、黄瓜和金针菇，浇入金汤底"
      },
      {
        "code": "H40",
        "id": "h_fisk_5",
        "name_da": "Sprødstegt fisk med sur-sød sauce (hel fisk med ben)",
        "name_zh": "松鼠鱼（有骨）",
        "description_da": "Hel friturestegt fisk med klassisk sød-syrlig sauce",
        "price": 268,
        "image": "images/h_fisk_5.jpg",
        "description_zh": "整条炸鱼，搭配经典酸甜酱汁"
      }
    ]
  },
  {
    "id": "hovedretter_groentsager",
    "name_da": "Hovedretter - Grøntsager",
    "name_zh": "主菜 - 青菜",
    "discount": true,
    "items": [
      {
        "code": "H41",
        "id": "h_groent_1",
        "name_da": "Tørstegt blomkål (Vegetar)",
        "name_zh": "干锅菜花",
        "description_da": "Wokstegt blomkål med selleri, svampe, rød og grøn peberfrugt",
        "price": 138,
        "image": "images/h_groent_1.jpg",
        "description_zh": "干锅菜花，搭配芹菜、蘑菇、青红椒"
      },
      {
        "code": "H42",
        "id": "h_groent_2",
        "name_da": "Tørstegt marineret lotusrod (Vegetar)",
        "name_zh": "干锅卤藕",
        "description_da": "Wokstegt marineret lotusrod med selleri, svampe, rød og grøn peberfrugt",
        "price": 158,
        "image": "images/h_groent_2.jpg",
        "description_zh": "干锅卤藕，搭配芹菜、蘑菇、青红椒"
      },
      {
        "code": "H43",
        "id": "h_groent_3",
        "name_da": "Lynstegte grøntsager med lotusrod og svampe (Vegetar)",
        "name_zh": "荷塘小炒",
        "description_da": "Lynstegt lotusrod med sukkerærter og sæsongrøntsager",
        "price": 158,
        "image": "images/h_groent_3.jpg",
        "description_zh": "快炒藕片，搭配荷兰豆和时令蔬菜"
      },
      {
        "code": "H44",
        "id": "h_groent_4",
        "name_da": "Di San Xian (Earth's Three Delights)",
        "name_zh": "地三鲜",
        "description_da": "Friturestegt aubergine, kartoffel og grøn peberfrugt",
        "price": 158,
        "image": "images/h_groent_4.jpg",
        "description_zh": "炸茄子、土豆和青椒"
      },
      {
        "code": "H45",
        "id": "h_groent_5",
        "name_da": "Sichuan-braiseret aubergine med hvidløgssauce (Vegetar)",
        "name_zh": "鱼香茄子",
        "description_da": "Aubergine i hvidløgs-chilisauce",
        "price": 158,
        "image": "images/h_groent_5.jpg",
        "description_zh": "茄子配蒜香酸辣酱"
      },
      {
        "code": "H46",
        "id": "h_groent_6",
        "name_da": "Mapo Tofu (med oksekød)",
        "name_zh": "麻婆豆腐",
        "description_da": "Tofu med hakket oksekød i Szechuan-sauce",
        "price": 158,
        "image": "images/h_groent_6.jpg",
        "description_zh": "豆腐配碎牛肉，四川风味酱"
      },
      {
        "code": "H47",
        "id": "h_groent_7",
        "name_da": "Rød braised Tofu (Vegetar)",
        "name_zh": "红烧豆腐",
        "description_da": "Klassisk tofu med shiitakesvampe og sæsongrøntsager",
        "price": 158,
        "image": "images/h_groent_7.jpg",
        "description_zh": "经典豆腐，搭配香菇和时令蔬菜"
      },
      {
        "code": "H48",
        "id": "h_groent_8",
        "name_da": "Tørstegte grønne bønner (Vegetar)",
        "name_zh": "干煸四季豆",
        "description_da": "Tørstegte grønne bønner med kinesisk oliven og tørret chili",
        "price": 158,
        "image": "images/h_groent_8.jpg",
        "description_zh": "干煸四季豆，搭配中国橄榄菜丁和干辣椒"
      },
      {
        "code": "H49",
        "id": "h_groent_9",
        "name_da": "Wokstegte hvidkål (Vegetar)",
        "name_zh": "手撕包菜",
        "description_da": "Wokstegt kinakål med hvidløg, mørk eddike og tørret chili",
        "price": 138,
        "image": "images/h_groent_9.jpg",
        "description_zh": "中火炒圆白菜，搭配大蒜、黑醋和干辣椒"
      },
      {
        "code": "H50",
        "id": "h_groent_10",
        "name_da": "Kinakål i gylden suppe (Vegetar)",
        "name_zh": "金汤奶白菜",
        "description_da": "Babypak choi med sorte svampe i gylden bouillon",
        "price": 158,
        "image": "images/h_groent_10.jpg",
        "description_zh": "奶白菜搭配黑木耳，淋金汤"
      },
      {
        "code": "H51",
        "id": "h_groent_11",
        "name_da": "Lynstegte hvidløgsstængler med fast tofu (Vegetar)",
        "name_zh": "蒜苔炒香干",
        "description_da": "Lynstegt hvidløgsstængel med røget tofu og sort bønnesovs",
        "price": 158,
        "image": "images/h_groent_11.jpg",
        "description_zh": "快炒蒜苔，搭配熏干和黑豆豉"
      },
      {
        "code": "H52",
        "id": "h_groent_12",
        "name_da": "Stegt vandspinat med fermenteret rød bønnepasta og tofu (Vegetar)",
        "name_zh": "南乳空心菜",
        "description_da": "Wokstegt vandspinat med fermenteret rød bønnerpasta og tofu",
        "price": 148,
        "image": "images/h_groent_12.jpg",
        "description_zh": "炒空心菜，搭配红腐乳和豆腐"
      },
      {
        "code": "H53",
        "id": "h_groent_13",
        "name_da": "Stegte pak choi med shiitake-svampe (Vegetar)",
        "name_zh": "香菇扒菜胆",
        "description_da": "Wokstegt babypak choi med shiitakesvampe",
        "price": 148,
        "description_zh": "炒小白菜，搭配香菇"
      },
      {
        "code": "H54",
        "id": "h_groent_14",
        "name_da": "Lynstegt Pak Choi (Vegetar)",
        "name_zh": "清炒油菜",
        "description_da": "Lynstegt babypak choi med hvidløg",
        "price": 98,
        "image": "images/h_groent_14.png",
        "description_zh": "快炒小白菜，搭配大蒜"
      }
    ]
  },
  {
    "id": "hovedretter_nudler",
    "name_da": "Hovedretter - Ris & Nudler",
    "name_zh": "主菜 - 饭面",
    "discount": true,
    "items": [
      {
        "code": "N55",
        "id": "h_nudler_1",
        "name_da": "Stegte nudler / ris / udon nudler / risnudler med oksekød",
        "name_zh": "牛肉炒面/饭/乌冬/河粉",
        "description_da": "Oksekød, æg og grøntsager",
        "price": 138,
        "image": "images/h_nudler_1.jpg",
        "options": [
          {
            "id": "noodle",
            "name_da": "Nudler",
            "name_zh": "面"
          },
          {
            "id": "rice",
            "name_da": "Ris",
            "name_zh": "饭"
          },
          {
            "id": "udon",
            "name_da": "Udon nudler",
            "name_zh": "乌冬"
          },
          {
            "id": "hefen",
            "name_da": "Risnudler",
            "name_zh": "河粉"
          }
        ],
        "description_zh": "牛肉、鸡蛋、蔬菜"
      },
      {
        "code": "N56",
        "id": "h_nudler_2",
        "name_da": "Stegte nudler / ris / udon nudler / ris nudler med kylling",
        "name_zh": "鸡肉炒面/饭/乌冬/河粉",
        "description_da": "Kylling, æg og grøntsager",
        "price": 138,
        "image": "images/h_nudler_2.jpg",
        "options": [
          {
            "id": "noodle",
            "name_da": "Nudler",
            "name_zh": "面"
          },
          {
            "id": "rice",
            "name_da": "Ris",
            "name_zh": "饭"
          },
          {
            "id": "udon",
            "name_da": "Udon nudler",
            "name_zh": "乌冬"
          },
          {
            "id": "hefen",
            "name_da": "Risnudler",
            "name_zh": "河粉"
          }
        ],
        "description_zh": "鸡肉、鸡蛋、蔬菜"
      },
      {
        "code": "N57",
        "id": "h_nudler_3",
        "name_da": "Stegte nudler / ris / udon nudler / ris nudler med rejer",
        "name_zh": "大虾炒面/饭/乌冬/河粉",
        "description_da": "Rejer, æg og grøntsager",
        "price": 138,
        "options": [
          {
            "id": "noodle",
            "name_da": "Nudler",
            "name_zh": "面"
          },
          {
            "id": "rice",
            "name_da": "Ris",
            "name_zh": "饭"
          },
          {
            "id": "udon",
            "name_da": "Udon nudler",
            "name_zh": "乌冬"
          },
          {
            "id": "hefen",
            "name_da": "Risnudler",
            "name_zh": "河粉"
          }
        ],
        "description_zh": "大虾、鸡蛋、蔬菜"
      },
      {
        "code": "N58",
        "id": "h_nudler_4",
        "name_da": "Vegetar stegte nudler / ris / udon nudler / ris nudler",
        "name_zh": "素炒面/饭/乌冬/河粉",
        "description_da": "Æg og ekstra sæsongrøntsager",
        "price": 128,
        "options": [
          {
            "id": "noodle",
            "name_da": "Nudler",
            "name_zh": "面"
          },
          {
            "id": "rice",
            "name_da": "Ris",
            "name_zh": "饭"
          },
          {
            "id": "udon",
            "name_da": "Udon nudler",
            "name_zh": "乌冬"
          },
          {
            "id": "hefen",
            "name_da": "Risnudler",
            "name_zh": "河粉"
          }
        ],
        "description_zh": "鸡蛋、额外时令蔬菜"
      }
    ]
  },
  {
    "id": "sauce",
    "name_da": "Sauce",
    "name_zh": "酱汁",
    "discount": false,
    "items": [
      {
        "code": "S55",
        "id": "sauce_1",
        "name_da": "Chili olie",
        "name_zh": "油泼辣椒",
        "description_da": "Klassisk kinesisk chiliolie, velegnet til nudler og kolde retter",
        "price": 25,
        "image": "images/sauce_1.jpg",
        "description_zh": "经典中式油泼辣酱，适合搭配面食、凉菜等"
      },
      {
        "code": "S56",
        "id": "sauce_2",
        "name_da": "Sød og sur sauce",
        "name_zh": "酸甜酱",
        "description_da": "Klassisk sød-syrlig dipsauce, velegnet til friturestegte retter og snacks",
        "price": 25,
        "image": "images/sauce_2.jpg",
        "description_zh": "酸甜口经典蘸酱，适配炸物、小食等"
      },
      {
        "code": "S57",
        "id": "sauce_3",
        "name_da": "Dumpling dip",
        "name_zh": "饺子醋",
        "description_da": "Speciel eddike-dipsauce til dumplings",
        "price": 15,
        "image": "images/sauce_3.jpg",
        "description_zh": "饺子专用蘸醋，适合搭配各类饺子、蒸饺"
      },
      {
        "code": "S60",
        "id": "sauce_6",
        "name_da": "Sriracha",
        "name_zh": "泰式是拉差辣酱",
        "description_da": "Klassisk thailandsk chilisauce, syrlig og stærk",
        "price": 15,
        "image": "images/sauce_6.jpg",
        "description_zh": "泰式经典辣酱，酸辣鲜香"
      }
    ]
  },
  {
    "id": "drikkekort",
    "name_da": "Drikkekort (Takeaway)",
    "name_zh": "饮品（外卖）",
    "discount": false,
    "orderTypes": [
      "takeaway"
    ],
    "categoryType": "drink",
    "items": [
      {
        "code": "V61",
        "id": "drikke_1",
        "name_da": "Kinesisk drik",
        "name_zh": "茶派",
        "description_da": "Kinesisk drikkevare",
        "price": 49,
        "image": "images/drikke_1.jpg",
        "description_zh": "中国饮品"
      },
      {
        "code": "V62",
        "id": "drikke_2",
        "name_da": "Coca-Cola",
        "name_zh": "可口可乐",
        "description_da": "Klassisk Coca-Cola med sukker",
        "price": 29,
        "image": "images/drikke_2.png"
      },
      {
        "code": "V62Z",
        "id": "drikke_2z",
        "name_da": "Coca-Cola Zero",
        "name_zh": "零度可乐",
        "description_da": "Coca-Cola uden sukker",
        "price": 29,
        "image": "images/drikke_2.png"
      },
      {
        "code": "V63",
        "id": "drikke_3",
        "name_da": "Still water",
        "name_zh": "无泡矿泉水",
        "description_da": "Mineralvand uden kulsyre",
        "price": 25,
        "image": "images/drikke_3.jpg",
        "description_zh": "无气泡矿泉水"
      },
      {
        "code": "V64",
        "id": "drikke_4",
        "name_da": "San Pellegrino",
        "name_zh": "巴黎水",
        "description_da": "San Pellegrino danskvand",
        "price": 60,
        "image": "images/drikke_4.webp",
        "description_zh": "圣培露无酒精气泡水"
      },
      {
        "code": "V65",
        "id": "drikke_5",
        "name_da": "Dansk øl",
        "name_zh": "嘉士伯啤酒",
        "description_da": "Dansk øl",
        "price": 39,
        "image": "images/drikke_5.webp",
        "description_zh": "丹麦产啤酒"
      },
      {
        "code": "V66",
        "id": "drikke_6",
        "name_da": "Kinesisk øl Tsingtao",
        "name_zh": "青岛啤酒",
        "description_da": "Kinesisk Tsingtao øl",
        "price": 49,
        "image": "images/drikke_6.jpg",
        "description_zh": "中国产青岛啤酒"
      },
      {
        "code": "V67",
        "id": "drikke_7",
        "name_da": "Japansk øl Sapporo",
        "name_zh": "日本三宝乐啤酒",
        "description_da": "Japansk Sapporo øl",
        "price": 49,
        "image": "images/drikke_7.jpg",
        "description_zh": "日本产札幌啤酒"
      },
      {
        "code": "V68",
        "id": "drikke_8",
        "name_da": "Koreansk Soju Peach/grape 13,0%",
        "name_zh": "韩国烧酒",
        "description_da": "Fersken/druesmag, 13,0% alkohol",
        "price": 129,
        "image": "images/drikke_8.jpg",
        "description_zh": "桃子/葡萄味，酒精度13.0%"
      },
      {
        "code": "V69",
        "id": "drikke_9",
        "name_da": "Rødvin (glas)",
        "name_zh": "红酒 (杯)",
        "description_da": "Rødvin, solgt pr. glas",
        "price": 69,
        "image": "images/drikke_9.webp",
        "description_zh": "红葡萄酒，按杯出售"
      },
      {
        "code": "V69-F",
        "id": "drikke_10",
        "name_da": "Rødvin (flaske)",
        "name_zh": "红酒 (瓶)",
        "description_da": "Rødvin, solgt pr. flaske",
        "price": 219,
        "description_zh": "红葡萄酒，整瓶出售"
      },
      {
        "code": "V70",
        "id": "drikke_11",
        "name_da": "Hvidvin (glas)",
        "name_zh": "白葡萄酒 (杯)",
        "description_da": "Hvidvin, solgt pr. glas",
        "price": 69,
        "image": "images/drikke_11.webp",
        "description_zh": "白葡萄酒，按杯出售"
      },
      {
        "code": "V70-F",
        "id": "drikke_12",
        "name_da": "Hvidvin (flaske)",
        "name_zh": "白葡萄酒 (瓶)",
        "description_da": "Hvidvin, solgt pr. flaske",
        "price": 219,
        "description_zh": "白葡萄酒，整瓶出售"
      },
      {
        "code": "V71",
        "id": "drikke_13",
        "name_da": "Danskvand 50cl",
        "name_zh": "气泡水",
        "description_da": "Danskvand 50cl",
        "price": 49,
        "description_zh": "50cl装丹麦产气泡水"
      },
      {
        "code": "V72",
        "id": "drikke_14",
        "name_da": "Lemonade 50cl",
        "name_zh": "柠檬水",
        "description_da": "Citronvand 50cl",
        "price": 59,
        "description_zh": "50cl装柠檬味饮料"
      }
    ]
  },
  {
    "id": "drikkekort_dinein",
    "name_da": "Drikkekort & Dessert (Dine-in)",
    "name_zh": "堂食饮品甜品",
    "discount": false,
    "orderTypes": [
      "dinein"
    ],
    "categoryType": "drink",
    "items": [
      {
        "code": "V80",
        "id": "din_1",
        "name_da": "Sodavand (lille)",
        "name_zh": "苏打水（小杯）",
        "description_da": "Vælg smag: Coca-Cola, Coca-Cola Zero, Faxe Kondi, Fanta eller Pepsi",
        "description_zh": "请选择口味：可口可乐、零度可乐、Faxe Kondi、芬达或百事可乐",
        "price": 39,
        "image": "images/drikke_2.png",
        "options": [
          {
            "id": "cola",
            "name_da": "Coca-Cola",
            "name_zh": "可口可乐"
          },
          {
            "id": "colazero",
            "name_da": "Coca-Cola Zero",
            "name_zh": "零度可乐"
          },
          {
            "id": "faxekondi",
            "name_da": "Faxe Kondi",
            "name_zh": "Faxe Kondi"
          },
          {
            "id": "fanta",
            "name_da": "Fanta",
            "name_zh": "芬达"
          },
          {
            "id": "pepsi",
            "name_da": "Pepsi",
            "name_zh": "百事可乐"
          }
        ]
      },
      {
        "code": "V81",
        "id": "din_2",
        "name_da": "Sodavand (mellem)",
        "name_zh": "苏打水（中杯）",
        "description_da": "Vælg smag: Coca-Cola, Coca-Cola Zero, Faxe Kondi, Fanta eller Pepsi",
        "description_zh": "请选择口味：可口可乐、零度可乐、Faxe Kondi、芬达或百事可乐",
        "price": 49,
        "image": "images/drikke_2.png",
        "options": [
          {
            "id": "cola",
            "name_da": "Coca-Cola",
            "name_zh": "可口可乐"
          },
          {
            "id": "colazero",
            "name_da": "Coca-Cola Zero",
            "name_zh": "零度可乐"
          },
          {
            "id": "faxekondi",
            "name_da": "Faxe Kondi",
            "name_zh": "Faxe Kondi"
          },
          {
            "id": "fanta",
            "name_da": "Fanta",
            "name_zh": "芬达"
          },
          {
            "id": "pepsi",
            "name_da": "Pepsi",
            "name_zh": "百事可乐"
          }
        ]
      },
      {
        "code": "V82",
        "id": "din_3",
        "name_da": "Sodavand (stor)",
        "name_zh": "苏打水（大杯）",
        "description_da": "Vælg smag: Coca-Cola, Coca-Cola Zero, Faxe Kondi, Fanta eller Pepsi",
        "description_zh": "请选择口味：可口可乐、零度可乐、Faxe Kondi、芬达或百事可乐",
        "price": 59,
        "image": "images/drikke_2.png",
        "options": [
          {
            "id": "cola",
            "name_da": "Coca-Cola",
            "name_zh": "可口可乐"
          },
          {
            "id": "colazero",
            "name_da": "Coca-Cola Zero",
            "name_zh": "零度可乐"
          },
          {
            "id": "faxekondi",
            "name_da": "Faxe Kondi",
            "name_zh": "Faxe Kondi"
          },
          {
            "id": "fanta",
            "name_da": "Fanta",
            "name_zh": "芬达"
          },
          {
            "id": "pepsi",
            "name_da": "Pepsi",
            "name_zh": "百事可乐"
          }
        ]
      },
      {
        "code": "V83",
        "id": "din_4",
        "name_da": "Kinesiske drikkevarer",
        "name_zh": "中国饮料",
        "price": 49,
        "image": "images/drikke_1.jpg"
      },
      {
        "code": "V84",
        "id": "din_5",
        "name_da": "Juice (50 cl)",
        "name_zh": "果汁（50cl）",
        "description_da": "Æblejuice eller appelsinjuice",
        "price": 49,
        "image": "images/drikke_3.jpg"
      },
      {
        "code": "V85",
        "id": "din_6",
        "name_da": "Limonade",
        "name_zh": "柠檬水",
        "price": 59,
        "image": "images/drikke_3.jpg"
      },
      {
        "code": "V86",
        "id": "din_7",
        "name_da": "Isvand (50 cl)",
        "name_zh": "冰水（50cl）",
        "price": 29,
        "image": "images/drikke_3.jpg"
      },
      {
        "code": "V87",
        "id": "din_8",
        "name_da": "San Pellegrino danskvand (50 cl)",
        "name_zh": "巴黎水气泡水（50cl）",
        "price": 49,
        "image": "images/drikke_4.webp"
      },
      {
        "code": "V88",
        "id": "din_9",
        "name_da": "San Pellegrino danskvand (1 L)",
        "name_zh": "巴黎水气泡水（1L）",
        "price": 69,
        "image": "images/drikke_4.webp"
      },
      {
        "code": "V89",
        "id": "din_10",
        "name_da": "Bubble Tea / Frugt-te Medium (50 cl)",
        "name_zh": "爆珠果茶中杯（50cl）",
        "description_da": "Vælg smag: Passionsfrugt, Jordbær, Æble eller Peach",
        "price": 49,
        "image": "images/drikke_1.jpg",
        "options": [
          {
            "id": "passion",
            "name_da": "Passionsfrugt",
            "name_zh": "百香果"
          },
          {
            "id": "jordboer",
            "name_da": "Jordbær",
            "name_zh": "草莓"
          },
          {
            "id": "aeble",
            "name_da": "Æble",
            "name_zh": "苹果"
          },
          {
            "id": "peach",
            "name_da": "Peach",
            "name_zh": "蜜桃"
          }
        ]
      },
      {
        "code": "V90",
        "id": "din_11",
        "name_da": "Bubble Tea / Frugt-te Large (75 cl)",
        "name_zh": "爆珠果茶大杯（75cl）",
        "description_da": "Vælg smag: Passionsfrugt, Jordbær, Æble eller Peach",
        "price": 59,
        "image": "images/drikke_1.jpg",
        "options": [
          {
            "id": "passion",
            "name_da": "Passionsfrugt",
            "name_zh": "百香果"
          },
          {
            "id": "jordboer",
            "name_da": "Jordbær",
            "name_zh": "草莓"
          },
          {
            "id": "aeble",
            "name_da": "Æble",
            "name_zh": "苹果"
          },
          {
            "id": "peach",
            "name_da": "Peach",
            "name_zh": "蜜桃"
          }
        ]
      },
      {
        "code": "V91",
        "id": "din_12",
        "name_da": "Tuborg Classic (33 cl)",
        "name_zh": "图堡经典啤酒",
        "price": 39,
        "image": "images/drikke_5.webp"
      },
      {
        "code": "V92",
        "id": "din_13",
        "name_da": "Tuborg Grøn (33 cl)",
        "name_zh": "图堡绿标啤酒",
        "price": 39,
        "image": "images/drikke_5.webp"
      },
      {
        "code": "V93",
        "id": "din_14",
        "name_da": "Carlsberg (33 cl)",
        "name_zh": "嘉士伯啤酒",
        "price": 39,
        "image": "images/drikke_5.webp"
      },
      {
        "code": "V94",
        "id": "din_15",
        "name_da": "Carlsberg Alkoholfri (33 cl)",
        "name_zh": "嘉士伯无酒精啤酒",
        "price": 39,
        "image": "images/drikke_5.webp"
      },
      {
        "code": "V95",
        "id": "din_16",
        "name_da": "Kinesisk Øl (33 cl)",
        "name_zh": "青岛啤酒",
        "price": 49,
        "image": "images/drikke_6.jpg"
      },
      {
        "code": "V96",
        "id": "din_17",
        "name_da": "Sapporo (65 cl)",
        "name_zh": "三宝乐啤酒",
        "price": 69,
        "image": "images/drikke_7.jpg"
      },
      {
        "code": "V97",
        "id": "din_18",
        "name_da": "Soju Peach/Grape (350 ml)",
        "name_zh": "韩国果味烧酒（桃子/葡萄）",
        "description_da": "Koreansk spiritus med frugtsmag (13,0% alc)",
        "price": 129,
        "image": "images/drikke_8.jpg"
      },
      {
        "code": "V98",
        "id": "din_19",
        "name_da": "Rødvin (glas)",
        "name_zh": "红酒（杯）",
        "price": 69,
        "image": "images/drikke_9.webp"
      },
      {
        "code": "V98-F",
        "id": "din_20",
        "name_da": "Rødvin (flaske)",
        "name_zh": "红酒（瓶）",
        "price": 249,
        "image": "images/drikke_9.webp"
      },
      {
        "code": "V99",
        "id": "din_21",
        "name_da": "Hvidvin (glas)",
        "name_zh": "白葡萄酒（杯）",
        "price": 69,
        "image": "images/drikke_11.webp"
      },
      {
        "code": "V99-F",
        "id": "din_22",
        "name_da": "Hvidvin (flaske)",
        "name_zh": "白葡萄酒（瓶）",
        "price": 249,
        "image": "images/drikke_11.webp"
      },
      {
        "code": "V100",
        "id": "din_23",
        "name_da": "Kaffe",
        "name_zh": "咖啡",
        "price": 39,
        "image": "images/drikke_3.jpg"
      },
      {
        "code": "V101",
        "id": "din_24",
        "name_da": "Te",
        "name_zh": "茶",
        "price": 39,
        "image": "images/drikke_1.jpg"
      },
      {
        "code": "V102",
        "id": "din_25",
        "name_da": "Is (3 kugler)",
        "name_zh": "冰淇淋（3球）",
        "description_da": "Vanilje, chokolade og jordbær",
        "price": 49,
        "image": "images/drikke_3.jpg"
      }
    ]
  },
  {
    "id": "forud_bestilling",
    "name_da": "Forud bestilling",
    "name_zh": "需提前预约",
    "discount": true,
    "preorder": true,
    "items": [
      {
        "code": "P1",
        "id": "preorder_1",
        "name_da": "Hongshao hel fisk (braiseret fisk)",
        "name_zh": "红烧全鱼",
        "description_da": "Hel fisk braiseret i sojasauce og krydderier. Skal bestilles 1 dag i forvejen.",
        "description_zh": "整条鱼红烧做法，酱香浓郁。需提前1天预约。",
        "price": 368,
        "image": "images/preorder_1.jpg",
        "lead_days": 1
      },
      {
        "code": "P2",
        "id": "preorder_2",
        "name_da": "Lu-braiseret oksekød",
        "name_zh": "卤牛肉",
        "description_da": "Kinesisk braiseret oksekød med special krydderier. Skal bestilles 3 dage i forvejen.",
        "description_zh": "中式卤牛肉，秘制卤料慢炖。需提前3天预约。",
        "price": 120,
        "lead_days": 3
      },
      {
        "code": "P3",
        "id": "preorder_3",
        "name_da": "Lu-braiseret svineinderste",
        "name_zh": "卤大肠",
        "description_da": "Kinesisk braiseret svineinderste med special krydderier. Skal bestilles 3 dage i forvejen.",
        "description_zh": "中式卤大肠，秘制卤料慢炖。需提前3天预约。",
        "price": 110,
        "lead_days": 3
      },
      {
        "code": "P4",
        "id": "preorder_4",
        "name_da": "Lu-braiseret oksemave",
        "name_zh": "卤牛肚",
        "description_da": "Kinesisk braiseret oksemave med special krydderier. Skal bestilles 3 dage i forvejen.",
        "description_zh": "中式卤牛肚，秘制卤料慢炖。需提前3天预约。",
        "price": 110,
        "lead_days": 3
      }
    ]
  }
];
