const express = require("express");
const path = require("path");
const ejs = require("ejs");
const erori = require("./erori.json");
const fs = require("fs"); 
app = express();
console.log("Folder proiect", __dirname); 
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
// Diferenta dintre __dirname si process.cwd() este ca __dirname
// este calea absoluta a folderului in care se afla fisierul js rulat de node,
// iar process.cwd() este calea absoluta a folderului din care am folosit comanda node

const vect_foldere = ["temp"];
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
};

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

      erori.eroare_default.imagine = path.join(erori.cale_baza, erori.eroare_default.imagine);

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

  console.log("Eroare:", identificator, titluAfisat, textAfisat, obErori.cale_baza);
  res.render("pagini/eroare", {
    titlu: titluAfisat,
    text: textAfisat,
    imagine: imagineAfisata,
  });
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
  res.render("pagini/index");
});

app.get("/despre", function (req, res) {
    const userIp = req.ip;
    res.render("pagini/despre", { userIp: userIp });
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

        afisareEroare(res, errorCode, eroareData.titlu, eroareData.text, eroareData.imagine);
      } else {
        throw err;
      }
    }
    //console.log(rezHtml);
    //console.log("Eroare: ", err);
    res.send(rezHtml);
  });
});





app.listen(8080);
console.log("Serverul a pornit");
