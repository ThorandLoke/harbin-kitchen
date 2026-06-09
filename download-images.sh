#!/bin/bash
# Download all menu images from harbinkitchen.dk
BASE="https://www.harbinkitchen.dk/wp-content/uploads"
DIR="/Users/weili/WorkBuddy/2026-06-07-15-30-48/pwa/images"

download() {
  local url="$1"
  local filename="$2"
  local dest="$DIR/$filename"
  if [ -f "$dest" ]; then
    echo "SKIP (exists): $filename"
    return
  fi
  echo "Downloading: $filename"
  curl -sL -o "$dest" "$url" --max-time 30
  if [ $? -eq 0 ] && [ -s "$dest" ]; then
    echo "  OK: $filename ($(wc -c < "$dest") bytes)"
  else
    echo "  FAILED: $filename"
    rm -f "$dest"
  fi
}

# === 餐前汤 (Suppe) ===
download "$BASE/2026/05/S1-768x768.jpg" "suppe_1.jpg"
download "$BASE/2026/05/S2-768x768.jpg" "suppe_2.jpg"
download "$BASE/2026/05/S3-768x768.jpg" "suppe_3.jpg"
download "$BASE/2026/05/S4-768x768.jpg" "suppe_4.jpg"

# === 前菜 (Forretter) ===
download "$BASE/2026/05/F2-768x404.jpg" "forretter_1.jpg"
download "$BASE/2026/05/F3-768x400.jpg" "forretter_2.jpg"
download "$BASE/2026/05/F4-768x744.png" "forretter_3.png"
download "$BASE/2026/05/F5.webp" "forretter_4.webp"
download "$BASE/2026/05/F6-768x575.jpg" "forretter_5.jpg"
download "$BASE/2026/05/F7-768x656.png" "forretter_6.png"
download "$BASE/2026/05/F8.jpg" "forretter_7.jpg"
download "$BASE/2026/05/F9-768x575.jpg" "forretter_8.jpg"
download "$BASE/2026/03/F05-768x432.jpg" "forretter_9.jpg"

# === 点心 (Dum) ===
download "$BASE/2026/05/微信图片_20260512215731_258_948-768x802.jpg" "dum_1.jpg"
download "$BASE/2026/03/D14-768x432.png" "dum_2.png"
download "$BASE/2026/03/D15-768x432.png" "dum_3.png"
download "$BASE/2026/03/D16-768x433.jpg" "dum_4.jpg"

# === 冷盘 (Kold Rette) ===
download "$BASE/2026/05/K1-768x768.jpg" "kold_1.jpg"
download "$BASE/2026/05/K2-768x651.jpg" "kold_2.jpg"
download "$BASE/2026/05/K3_副本-768x614.jpg" "kold_3.jpg"
download "$BASE/2026/05/K4-768x768.jpg" "kold_4.jpg"
download "$BASE/2026/05/K5-768x665.jpg" "kold_5.jpg"
download "$BASE/2026/05/K6-768x768.jpg" "kold_6.jpg"

# === 鸡肉 (Kylling) ===
download "$BASE/2026/05/H1-768x768.jpg" "h_kylling_1.jpg"
download "$BASE/2026/05/H2-768x768.jpg" "h_kylling_2.jpg"
download "$BASE/2026/05/H4-768x768.jpg" "h_kylling_4.jpg"
download "$BASE/2026/05/H5-768x768.jpg" "h_kylling_5.jpg"
download "$BASE/2026/05/H6-768x768.jpg" "h_kylling_6.jpg"

# === 牛肉 (Oksekød) ===
download "$BASE/2026/05/H7-1-768x768.jpg" "h_okse_1.jpg"
download "$BASE/2026/05/H9-768x768.jpg" "h_okse_3.jpg"
download "$BASE/2026/05/H10-768x768.jpg" "h_okse_4.jpg"
download "$BASE/2026/05/H11-768x768.jpg" "h_okse_5.jpg"
download "$BASE/2026/05/H12-768x768.jpg" "h_okse_6.jpg"
download "$BASE/2026/05/H13-768x768.jpg" "h_okse_7.jpg"
download "$BASE/2026/05/H14-768x768.jpg" "h_okse_8.jpg"

# === 猪肉 (Svinekød) ===
download "$BASE/2026/05/H15-768x768.jpg" "h_svine_1.jpg"
download "$BASE/2026/05/H16-768x768.jpg" "h_svine_2.jpg"
download "$BASE/2026/05/H17-768x768.jpg" "h_svine_3.jpg"
download "$BASE/2026/05/H18-768x768.jpg" "h_svine_4.jpg"
download "$BASE/2026/05/H19-768x768.jpg" "h_svine_5.jpg"
download "$BASE/2026/05/H20-768x768.jpg" "h_svine_6.jpg"
download "$BASE/2026/05/H21-768x768.jpg" "h_svine_7.jpg"
download "$BASE/2026/05/H22-768x768.jpg" "h_svine_8.jpg"
download "$BASE/2026/05/H23-768x768.jpg" "h_svine_9.jpg"
download "$BASE/2026/05/H24-768x768.jpg" "h_svine_10.jpg"

# === 羊肉 (Lammekød) ===
download "$BASE/2026/05/H25-768x768.jpg" "h_lam_1.jpg"
download "$BASE/2026/05/H27-768x768.jpg" "h_lam_3.jpg"

# === 鸭肉 (And) ===
download "$BASE/2026/05/H28-768x768.jpg" "h_and_1.jpg"
download "$BASE/2026/05/H30-768x768.jpg" "h_and_3.jpg"

# === 虾类 (Rejer) ===
download "$BASE/2026/05/H31-768x768.jpg" "h_rejer_1.jpg"
download "$BASE/2026/05/H32-768x768.jpg" "h_rejer_2.jpg"
download "$BASE/2026/05/H34-768x768.jpg" "h_rejer_4.jpg"
download "$BASE/2026/05/H35-768x768.jpg" "h_rejer_5.jpg"

# === 鱼类 (Fisk) ===
download "$BASE/2026/05/H36-768x768.jpg" "h_fisk_1.jpg"
download "$BASE/2026/05/H37-768x768.jpg" "h_fisk_2.jpg"
download "$BASE/2026/05/H38-768x768.jpg" "h_fisk_3.jpg"
download "$BASE/2026/05/H39-768x768.jpg" "h_fisk_4.jpg"
download "$BASE/2026/05/H40-768x768.jpg" "h_fisk_5.jpg"

# === 青菜 (Grøntsager) ===
download "$BASE/2026/05/H41-768x768.jpg" "h_groent_1.jpg"
download "$BASE/2026/05/H42-768x768.jpg" "h_groent_2.jpg"
download "$BASE/2026/05/H43-768x768.jpg" "h_groent_3.jpg"
download "$BASE/2026/05/H44-768x768.jpg" "h_groent_4.jpg"
download "$BASE/2026/05/H45-768x768.jpg" "h_groent_5.jpg"
download "$BASE/2026/05/H46-768x768.jpg" "h_groent_6.jpg"
download "$BASE/2026/05/H47-768x768.jpg" "h_groent_7.jpg"
download "$BASE/2026/05/H48-768x768.jpg" "h_groent_8.jpg"
download "$BASE/2026/05/H49-768x768.jpg" "h_groent_9.jpg"
download "$BASE/2026/05/H50-768x768.jpg" "h_groent_10.jpg"
download "$BASE/2026/05/H51-768x768.jpg" "h_groent_11.jpg"
download "$BASE/2026/05/H52-768x768.jpg" "h_groent_12.jpg"
download "$BASE/2026/03/H48-768x432.png" "h_groent_14.png"

# === 炒饭炒面 (Nudler) ===
download "$BASE/2026/05/N55-768x913.jpg" "h_nudler_1.jpg"
download "$BASE/2026/05/N56-768x768.jpg" "h_nudler_2.jpg"

# === 酱汁 (Sauce) ===
download "$BASE/2026/03/S55.jpg" "sauce_1.jpg"
download "$BASE/2026/03/S56-768x480.jpg" "sauce_2.jpg"
download "$BASE/2026/03/S57.jpg" "sauce_3.jpg"
download "$BASE/2026/03/S58-768x512.jpg" "sauce_4.jpg"
download "$BASE/2026/03/S59.jpg" "sauce_5.jpg"
download "$BASE/2026/03/S60.jpg" "sauce_6.jpg"

# === 饮品 (Drikkekort) ===
download "$BASE/2026/03/V61.Chinese.jpg" "drikke_1.jpg"
download "$BASE/2026/03/V62.sodavand-768x768.png" "drikke_2.png"
download "$BASE/2026/03/V63.Still-water.jpg" "drikke_3.jpg"
download "$BASE/2026/03/V64.San-Pellegrino-768x2878.webp" "drikke_4.webp"
download "$BASE/2026/03/V65.Dansk-ol.webp" "drikke_5.webp"
download "$BASE/2026/03/V66.Tsingtao-768x976.jpg" "drikke_6.jpg"
download "$BASE/2026/03/V67.Soppro.jpg" "drikke_7.jpg"
download "$BASE/2026/03/V68.Soju_.jpg" "drikke_8.jpg"
download "$BASE/2026/03/V69.rod-vin.webp" "drikke_9.webp"
download "$BASE/2026/03/V70.Hvidvin.webp" "drikke_11.webp"

echo ""
echo "=== Download complete ==="
echo "Total files in images/:"
ls -la "$DIR" | wc -l
