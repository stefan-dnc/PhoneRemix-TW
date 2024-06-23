const express = require("express");
const path = require("path");
const ejs = require("ejs");
const sass = require("sass");
const erori = require("./erori.json");
const galerie = require("./resurse/json/galerie.json");
const fs = require("fs");
const sharp = require("sharp");

const AccesBD = require("./module_proprii/accesbd.js");
const formidable = require("formidable");
const { Utilizator } = require("./module_proprii/utilizator.js");
const session = require("express-session");
const Drepturi = require("./module_proprii/drepturi.js");

app = express();
console.log("Folder proiect", __dirname);
console.log("Cale fisier", __filename);
console.log("Director de lucru", process.cwd());
// Diferenta dintre __dirname si process.cwd() este ca __dirname
// este calea absoluta a folderului in care se afla fisierul js rulat de node,
// iar process.cwd() este calea absoluta a folderului din care am folosit comanda node

const Client = require("pg").Client;

app.use(
  session({
    // aici se creeaza proprietatea session a requestului (pot folosi req.session)
    secret: "abcdefg", //folosit de express session pentru criptarea id-ului de sesiune
    resave: true,
    saveUninitialized: false,
  })
);

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

const vect_foldere = ["temp", "backup", "poze_uploadate"];
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

app.post("/login", function (req, res) {
  /*TO DO
        testam daca a confirmat mailul
    */
  var username;
  var formular = new formidable.IncomingForm();

  formular.parse(req, function (err, campuriText, campuriFisier) {
    var parametriCallback = {
      req: req,
      res: res,
      parola: campuriText.parola[0],
    };

    Utilizator.getUtilizDupaUsername(
      campuriText.username[0],
      parametriCallback,
      function (u, obparam, eroare) {
        //proceseazaUtiliz
        let parolaCriptata = Utilizator.criptareParola(obparam.parola);
        if (u.parola == parolaCriptata && u.confirmat_mail == true) {
          u.poza = u.poza
            ? path.join("poze_uploadate", u.username, u.poza)
            : "";
          obparam.req.session.utilizator = u;
          obparam.req.session.mesajLogin = "Bravo! Te-ai logat!";
          console.log("Logare cu succes");
          obparam.res.redirect("/index");
        } else {
          console.log("Eroare logare");
          obparam.req.session.mesajLogin =
            "Date logare incorecte sau nu a fost confirmat mailul!";
          obparam.res.redirect("/index");
        }
      }
    );
  });
});

app.use("/*", function (req, res, next) {
  res.locals.optiuni = obGlobal.optiuni;
  res.locals.Drepturi = Drepturi;
  if (req.session.utilizator) {
    req.utilizator = res.locals.utilizator = new Utilizator(
      req.session.utilizator
    );
  }
  next();
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

app.post("/inregistrare", function (req, res) {
  var username;
  var poza;
  var formular = new formidable.IncomingForm();
  formular.parse(req, function (err, campuriText, campuriFisier) {
    //4
    console.log("Inregistrare:", campuriText);

    console.log(campuriFisier);
    console.log(poza, username);
    var eroare = "";

    var utilizNou = new Utilizator();
    try {
      utilizNou.setareNume = campuriText.nume[0];
      utilizNou.setareUsername = campuriText.username[0];
      utilizNou.email = campuriText.email[0];
      utilizNou.prenume = campuriText.prenume[0];

      utilizNou.parola = campuriText.parola[0];
      utilizNou.culoare_chat = campuriText.culoare_chat[0];
      utilizNou.poza = poza;
      Utilizator.getUtilizDupaUsername(
        campuriText.username[0],
        {},
        function (u, parametru, eroareUser) {
          if (eroareUser == -1) {
            //nu exista username-ul in BD
            //TO DO salveaza utilizator
            utilizNou.salvareUtilizator();
          } else {
            eroare += "Mai exista username-ul";
          }

          if (!eroare) {
            client.query(
              "select * from unnest(enum_range(null::categorie_brand))",
              function (err, rezOptiuni) {
                res.render("pagini/inregistrare", {
                  raspuns: "Inregistrare cu succes!",
                  optiuni: rezOptiuni.rows,
                });
              }
            );
          } else
            res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
        }
      );
    } catch (e) {
      console.log(e);
      eroare += "Eroare site; reveniti mai tarziu";
      console.log(eroare);
      res.render("pagini/inregistrare", { err: "Eroare: " + eroare });
    }
  });
  formular.on("field", function (nume, val) {
    // 1

    console.log(`--- ${nume}=${val}`);

    if (nume == "username") username = val;
  });
  formular.on("fileBegin", function (nume, fisier) {
    //2
    console.log("fileBegin");

    console.log(nume, fisier);
    //TO DO adaugam folderul poze_uploadate ca static si sa fie creat de aplicatie
    //TO DO in folderul poze_uploadate facem folder cu numele utilizatorului (variabila folderUser)
    var folderUser = path.join(__dirname, "poze_uploadate", username);

    if (!fs.existsSync(folderUser)) {
      fs.mkdirSync(folderUser);
    }

    fisier.filepath = path.join(folderUser, fisier.originalFilename);
    poza = fisier.originalFilename;
    //fisier.filepath=folderUser+"/"+fisier.originalFilename
    console.log("fileBegin:", poza);
    console.log("fileBegin, fisier:", fisier);
  });
  formular.on("file", function (nume, fisier) {
    //3
    console.log("file");
    console.log(nume, fisier);
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

app.post("/profil", function (req, res) {
  console.log("profil");
  if (!req.session.utilizator) {
    afisareEroare(res, 403);
    return;
  }
  var formular = new formidable.IncomingForm();

  formular.parse(req, function (err, campuriText, campuriFile) {
    var parolaCriptata = Utilizator.criptareParola(campuriText.parola[0]);

    AccesBD.getInstanta().updateParametrizat(
      {
        tabel: "utilizatori",
        campuri: ["nume", "prenume", "email", "culoare_chat"],
        valori: [
          `${campuriText.nume[0]}`,
          `${campuriText.prenume[0]}`,
          `${campuriText.email[0]}`,
          `${campuriText.culoare_chat[0]}`,
        ],
        conditiiAnd: [
          `parola='${parolaCriptata}'`,
          `username='${campuriText.username[0]}'`,
        ],
      },
      function (err, rez) {
        if (err) {
          console.log(err);
          afisareEroare(res, 2);
          return;
        }
        console.log(rez.rowCount);
        if (rez.rowCount == 0) {
          res.render("pagini/profil", {
            mesaj: "Update-ul nu s-a realizat. Verificati parola introdusa.",
          });
          return;
        } else {
          //actualizare sesiune
          console.log("ceva");
          req.session.utilizator.nume = campuriText.nume[0];
          req.session.utilizator.prenume = campuriText.prenume[0];
          req.session.utilizator.email = campuriText.email[0];
          req.session.utilizator.culoare_chat = campuriText.culoare_chat[0];
          res.locals.utilizator = req.session.utilizator;
        }

        res.render("pagini/profil", {
          mesaj: "Update-ul s-a realizat cu succes.",
        });
      }
    );
  });
});

fs.watch(obGlobal.folderScss, function (eveniment, numeFis) {
  console.log(eveniment, numeFis);
  if (eveniment == "change" || eveniment == "rename") {
    let caleCompleta = path.join(obGlobal.folderScss, numeFis);
    if (fs.existsSync(caleCompleta)) {
      compileazaScss(caleCompleta);
    }
  }
});

app.set("view engine", "ejs");

app.use("/resurse", express.static(path.join(__dirname + "/resurse")));
app.use("/node_modules", express.static(path.join(__dirname + "/node_modules")));
app.use("/poze_uploadate", express.static(path.join(__dirname + "/poze_uploadate")));
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "frame-src 'self' https://www.youtube.com https://www.google.com ;"
  );

  client.query(
    "select * from unnest(enum_range(null::categorie_brand))",
    function (err, rezOptiuni) {
      if (err) {
        return next(err);
      }
      res.locals.optiuni = rezOptiuni.rows;
      next();
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

app.use((req, res, next) => {
  if (req.url.endsWith(".ejs")) {
    afisareEroare(res, 400);
  } else {
    next();
  }
});

client.query(
  "select * from unnest(enum_range(null::tipuri_produse))",
  function (err, rezCategorie) {
    if (err) {
      console.log(err);
    } else {
      obGlobal.optiuni = rezCategorie.rows;
    }
  }
);

//http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}
app.get("/cod/:username/:token",function(req,res){
    /*TO DO parametriCallback: cu proprietatile: request (req) si token (luat din parametrii cererii)
        setat parametriCerere pentru a verifica daca tokenul corespunde userului
    */
    console.log(req.params);
    
    try {
        var parametriCallback ={
            req:req,
            token:req.params.token
        }
        Utilizator.getUtilizDupaUsername(req.params.username,parametriCallback ,function(u,obparam){
            let parametriCerere = {
                tabel:"utilizatori",
                campuri:{"confirmat_mail":true},
                conditiiAnd:[
                    [ `id='${u.id}'`]
                ]
            }
            AccesBD.getInstanta().update(
                parametriCerere, 
                function (err, rezUpdate){
                    if(err || rezUpdate.rowCount==0){
                        console.log("Cod:", err);
                        afisareEroare(res,3);
                    }
                    else{
                        res.render("pagini/confirmare.ejs");
                    }
                })
        })
    }
    catch (e){
        console.log(e);
        afisareEroare(res,2);
    }
})

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

app.get(["/", "/home", "/index"], function (req, res) {
  client.query(
    "select * from unnest(enum_range(null::categorie_brand))",
    function (err, rezOptiuni) {
      generateSmallerImages(galerie.imagini, galerie.cale_galerie);
      const galerie_carousel = galerie.imagini;
      const galerie_path = galerie.cale_galerie;
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

app.get("/favicon.ico", function (req, res) {
  const faviconPath = path.join(__dirname, "/resurse/favicon/favicon.ico");
  res.sendFile(faviconPath);
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.locals.utilizator = null;
  res.render("pagini/logout");
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
    res.send(rezHtml + "");
  });
});

app.listen(8080);
console.log("Serverul a pornit");
