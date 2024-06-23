const express = require("express");
const path = require("path");
const ejs = require("ejs");
const sass = require("sass");
const erori = require("./erori.json");
const galerie = require("./resurse/json/galerie.json");
const fs = require("fs");
const sharp = require("sharp");
app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
// Diferenta dintre __dirname si process.cwd() este ca __dirname
// este calea absoluta a folderului in care se afla fisierul js rulat de node,
// iar process.cwd() este calea absoluta a folderului din care am folosit comanda node

const Client = require("pg").Client;

var client = new Client({
  database: "cti_2024",
  user: "postgres",
  password: "qAaKgmhk",
  host: "localhost",
  port: 5432,
});
client.connect();

client.query(
  "select * from unnest(enum_range(NULL::categorie))",
  function (err, rez) {
    console.log(rez);
  }
);

const vect_foldere = ["temp", "backup"];
vect_foldere.forEach((folder) => {
  const folderPath = path.join(__dirname, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    console.log(`Folderul "${folder}" a fost creat.`);
  } else {
    console.log(`Folderul "${folder}" exista deja.`);
  }
});

const obGlobal = {
  obErori: null,
  folderScss: path.join(__dirname, "resurse/scss"),
  folderCss: path.join(__dirname, "resurse/css"),
  folderBackup: path.join(__dirname, "backup"),
};

app.get("/produse", function (req, res) {
  console.log(req.query);
  var conditieQuery = "";
  if (req.query.tip) {
    conditieQuery = ` where brand='${req.query.tip}'`;
  }
  client.query(
    "select * from unnest(enum_range(null::categorie_brand))",
    function (err, rezOptiuni) {
      client.query(
        `select * from produse ${conditieQuery}`,
        function (err, rez) {
          if (err) {
            console.log(err);
            afisareEroare(res, 2);
          } else {
            res.render("pagini/produse", {
              produse: rez.rows,
              optiuni: rezOptiuni.rows,
            });
          }
        }
      );
    }
  );
});

app.get("/produs/:id", function (req, res) {
  client.query(
    "select * from unnest(enum_range(null::categorie_brand))",
    function (err, rezOptiuni) {
      client.query(
        `select * from produse where id=${req.params.id}`,
        function (err, rez) {
          if (err) {
            console.log(err);
            afisareEroare(res, 2);
          } else {
            res.render("pagini/produs", {
              prod: rez.rows[0],
              optiuni: rezOptiuni.rows,
            });
          }
        }
      );
    }
  );
});

function initErori() {
  fs.readFile("erori.json", "utf8", (err, data) => {
    if (err) {
      console.error("Eroare la citirea fisierului erori.json:", err);
      return;
    }

    try {
      const erori = JSON.parse(data);

      erori.info_erori.forEach((eroare) => {
        eroare.imagine = path.join(erori.cale_baza, eroare.imagine);
      });

      erori.eroare_default.imagine = path.join(
        erori.cale_baza,
        erori.eroare_default.imagine
      );

      obGlobal.obErori = erori;

      console.log("Datele erori.json sunt incarcate");
    } catch (parseError) {
      console.error("Eroare la parsarea fisierului erori.json:", parseError);
    }
  });
}
initErori();

function afisareEroare(res, identificator, titlu, text, imagine) {
  const { obErori } = obGlobal;
  const eroare =
    obErori.info_erori.find(
      (eroare) => eroare.identificator === identificator
    ) || obErori.eroare_default;

  const titluAfisat = titlu || eroare.titlu;
  const textAfisat = text || eroare.text;
  const imagineAfisata = imagine || eroare.imagine;
  console.log("AAAAAAAAAAAAAAAA", imagine, eroare.imagine);

  console.log(
    "Eroare:",
    identificator,
    titluAfisat,
    textAfisat,
    obErori.cale_baza
  );
  res.render("pagini/eroare", {
    titlu: titluAfisat,
    text: textAfisat,
    imagine: imagineAfisata,
  });
}

function renderImagesBySeason(res) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  let anotimp;

  if (currentMonth >= 3 && currentMonth <= 5) {
    anotimp = "primavara";
  } else if (currentMonth >= 6 && currentMonth <= 8) {
    anotimp = "vara";
  } else if (currentMonth >= 9 && currentMonth <= 11) {
    anotimp = "toamna";
  } else {
    anotimp = "iarna";
  }

  const filteredImages = galerie.imagini.filter(
    (image) => image.anotimp === anotimp
  );

  return filteredImages;
}

async function resizeImage(inputPath, outputPath, width, height) {
  try {
    await sharp(inputPath)
      .resize({ width: width, height: height })
      .toFile(outputPath);
  } catch (error) {
    console.error("Eroare la redimensionarea imaginii", error);
  }
}
async function generateSmallerImages(galerie, galeriePath) {
  const smallWidth = 650;
  const smallHeight = 650;
  const mediumWidth = 700;
  const mediumHeight = 700;
  const bigWidth = 750;
  const bigHeight = 750;

  for (const imagine of galerie) {
    const inputPath = galeriePath + "/" + imagine.cale_fisier;

    await resizeImage(
      inputPath,
      galeriePath + "/small/" + imagine.cale_fisier,
      smallWidth,
      smallHeight
    );
    await resizeImage(
      inputPath,
      galeriePath + "/medium/" + imagine.cale_fisier,
      mediumWidth,
      mediumHeight
    );
    await resizeImage(
      inputPath,
      galeriePath + "/big/" + imagine.cale_fisier,
      bigWidth,
      bigHeight
    );
  }
}

app.set("view engine", "ejs");

app.use("/resurse", express.static(path.join(__dirname + "/resurse")));
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-src 'self' https://www.youtube.com https://www.google.com ;"
  );
  next();
});
app.get(["/", "/home", "/index"], function (req, res) {
  client.query(
    "select * from unnest(enum_range(null::categorie_brand))",
    function (err, rezOptiuni) {
      generateSmallerImages(galerie.imagini, galerie.cale_galerie);
      const galerie_carousel = galerie.imagini;
      const galerie_path = galerie.cale_galerie;
      console.log("IMAGINI_CAROUSEL", galerie_carousel);
      console.log("IMAGINI_NORMAL", galerie);
      console.log("CALE", galerie_path, "\n\n\n\n");
      res.render("pagini/index", {
        galerie_path: galerie_path,
        galerie_carousel: galerie_carousel,
        optiuni: rezOptiuni.rows,
      });
    }
  );
});

app.get("/despre", function (req, res) {
  client.query(
    "select * from unnest(enum_range(null::categorie_brand))",
    function (err, rezOptiuni) {
      generateSmallerImages(galerie.imagini, galerie.cale_galerie);
      const userIp = req.ip;
      const galerie_filtrata = renderImagesBySeason(res);
      const galerie_path = galerie.cale_galerie;
      console.log("IMAGINI", galerie);
      console.log("CALE", galerie_path, "\n\n\n\n");
      res.render("pagini/despre", {
        userIp: userIp,
        galerie: galerie_filtrata,
        galerie_path: galerie_path,
        optiuni: rezOptiuni.rows,
      });
    }
  );
});

app.use("/resurse", function (req, res, next) {
  const resourcePath = path.join(__dirname, "resurse", req.url);

  if (fs.existsSync(resourcePath) && fs.lstatSync(resourcePath).isDirectory()) {
    const indexPath = path.join(resourcePath, "index.html");
    if (fs.existsSync(indexPath)) {
      next();
    } else {
      afisareEroare(res, 403);
    }
  } else {
    next();
  }
});

app.get("/favicon.ico", function (req, res) {
  const faviconPath = path.join(__dirname, "/resurse/favicon/favicon.ico");
  res.sendFile(faviconPath);
});

app.use((req, res, next) => {
  if (req.url.endsWith(".ejs")) {
    afisareEroare(res, 400);
  } else {
    next();
  }
});

app.get("/*", function (req, res) {
  console.log(req.url);
  res.render("pagini" + req.url, function (err, rezHtml) {
    if (err) {
      if (err.message.indexOf("Failed to lookup view") !== -1) {
        const errorCode = parseInt(req.url.split("/")[1]);
        const { obErori } = obGlobal;
        const eroareData =
          obErori.info_erori.find(
            (eroare) => eroare.identificator === errorCode
          ) || obErori.eroare_default;

        afisareEroare(
          res,
          errorCode,
          eroareData.titlu,
          eroareData.text,
          eroareData.imagine
        );
      } else {
        throw err;
      }
    }
    //console.log(rezHtml);
    //console.log("Eroare: ", err);
    res.send(rezHtml);
  });
});

function compileazaScss(caleScss, caleCss) {
  console.log("cale:", caleCss);
  if (!caleCss) {
    let numeFisExt = path.basename(caleScss);
    let numeFis = numeFisExt.split(".")[0];
    caleCss = numeFis + ".css";
  }

  if (!path.isAbsolute(caleScss))
    caleScss = path.join(obGlobal.folderScss, caleScss);
  if (!path.isAbsolute(caleCss))
    caleCss = path.join(obGlobal.folderCss, caleCss);

  let caleBackup = path.join(obGlobal.folderBackup, "resurse/css");
  if (!fs.existsSync(caleBackup)) {
    fs.mkdirSync(caleBackup, { recursive: true });
  }

  let numeFisCss = path.basename(caleCss);
  if (fs.existsSync(caleCss)) {
    fs.copyFileSync(
      caleCss,
      path.join(obGlobal.folderBackup, "resurse/css", numeFisCss)
    );
  }
  rez = sass.compile(caleScss, { sourceMap: true });
  fs.writeFileSync(caleCss, rez.css);
}
vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
  if (path.extname(numeFis) == ".scss") {
    compileazaScss(numeFis);
  }
}

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
  console.log(eveniment, numeFis);
  if (eveniment == "change" || eveniment == "rename") {
    let caleCompleta = path.join(obGlobal.folderScss, numeFis);
    if (fs.existsSync(caleCompleta)) {
      compileazaScss(caleCompleta);
    }
  }
});

app.listen(8080);
console.log("Serverul a pornit");
