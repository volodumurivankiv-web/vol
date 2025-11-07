// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// дозволяємо запити з фронта (Shopify)
app.use(cors());
app.use(express.json());

// ТВОЯ ТАБЛИЦЯ ЦІН 1:1 ЯК У SHOPIFY
const prices = {
  "dab": {
    "Rustykalny": {
      "Lita lamela": { 16:150, 20:167, 26:210, 35:217, 40:283, 52:290, 60:400 },
      "Laczenie na mikrowczepy": { 20:150, 26:187, 40:247, 52:255, 60:393 }
    },
    "A/B": {
      "Lita lamela": { 16:173, 20:210, 26:253, 35:260, 40:353, 52:363, 60:420 },
      "Laczenie na mikrowczepy": { 20:160, 26:193, 40:260, 52:303, 60:416 }
    }
  },
  "jesion": {
    "Rustykalny": { "Lita lamela": { 20:173, 40:297 } },
    "A/B": {
      "Lita lamela": { 19:190, 26:210, 40:307 },
      "Laczenie na mikrowczepy": { 19:170, 26:185, 40:270 }
    }
  },
  "jesion_brazowy_rdzen": {
    "A/B": {
      "Lita lamela": { 19:185, 26:205, 40:302 },
      "Laczenie na mikrowczepy": { 19:153, 26:173, 40:257 }
    }
  },
  "buk_parzony": {
    "A/B": {
      "Lita lamela": { 19:153, 26:173, 40:213 },
      "Laczenie na mikrowczepy": { 19:133, 26:153, 40:193 }
    }
  },
  "buk_czerwony": {
    "A/B": {
      "Lita lamela": { 19:170, 26:203, 40:250 },
      "Laczenie na mikrowczepy": { 19:167, 26:183, 40:233 }
    }
  },
  "brzoza": {
    "A/B": {
      "Lita lamela": { 19:160, 26:180, 40:233 },
      "Laczenie na mikrowczepy": { 19:150, 26:170, 40:223 }
    }
  },
  "klon": { "A/B": { "Lita lamela": { 19:170, 26:200, 40:323 } } },
  "dab_dymiony": {
    "Rustykalny": {
      "Lita lamela": { 16:207, 20:223, 26:267, 35:283, 40:353, 52:367, 60:483 },
      "Laczenie na mikrowczepy": { 20:213, 26:250, 40:317, 60:467 }
    },
    "A/B": {
      "Lita lamela": { 16:217, 20:277, 26:310, 35:317, 40:417, 52:427, 60:617 },
      "Laczenie na mikrowczepy": { 20:220, 26:257, 40:343 }
    }
  }
};

// POST /calculate — рахуємо ціну
app.post("/calculate", (req, res) => {
  try {
    const {
      material,   // "dab"
      klasa,      // "Rustykalny"
      lamela,     // "Lita lamela"
      grubosc,    // "40"
      szerokosc,  // "600"
      dlugosc,    // "1200"
      addons      // масив додаткових опцій
    } = req.body;

    const w = parseFloat(szerokosc);
    const h = parseFloat(dlugosc);
    const t = Number(grubosc);

    if (!material || !klasa || !lamela || !t || !w || !h) {
      return res.json({ success: false, error: "Brak wymaganych parametrów" });
    }

    const cenaM2 = prices?.[material]?.[klasa]?.[lamela]?.[t];
    if (!cenaM2) {
      return res.json({ success: false, error: "Brak ceny dla podanych parametrów" });
    }

    const area = (w / 1000) * (h / 1000); // m²
    let total = cenaM2 * area;

    // додаємо опції
    if (Array.isArray(addons)) {
      addons.forEach(opt => {
        const price = parseFloat(opt.price);
        const type = opt.type; // "m2" або "szt"
        if (!price || !type) return;
        if (type === "m2") total += price * area;
        else total += price;
      });
    }

    const totalCents = Math.round(total * 100);

    res.json({
      success: true,
      total: Number(total.toFixed(2)), // сума в zł
      totalCents                       // в groszach для quantity
    });
  } catch (e) {
    console.error(e);
    res.json({ success: false, error: "Błąd serwera" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
