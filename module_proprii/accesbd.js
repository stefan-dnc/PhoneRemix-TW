const {Client, Pool}=require("pg");

/**
 * Clasa pentru accesul la baza de date
 */

class AccesBD {
  static #instanta = null;
  static #initializat = false;

  constructor() {
    if (AccesBD.#instanta) {
      throw new Error("Deja a fost instantiat");
    } else if (!AccesBD.#initializat) {
      throw new Error(
        "Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare"
      );
    }
  }

  /**
   * Initializeaza conexiunea la baza de date locala
   */
  initLocal() {
    this.client = new Client({
      database: "cti_2024",
      user: "postgres",
      password: "qAaKgmhk",
      host: "localhost",
      port: 5432,
    });
    this.client.connect();
  }

  /**
   * Returneaza clientul de conexiune la baza de date
   *
   * @returns {Client} Clientul de conexiune
   * @throws {Error} Daca instanta nu a fost creata
   */
  getClient() {
    if (!AccesBD.#instanta) {
      throw new Error("Nu a fost instantiata clasa");
    }
    return this.client;
  }

  /**
     * @typedef {object} ObiectConexiune - obiect primit de functiile care realizeaza un query
     * @property {string} init - tipul de conexiune ("init", "render" ...)
     * 
     * /

    /**
     * Returneaza instanta unica a clasei
     *
     * @param {ObiectConexiune} init - un obiect cu datele pentru query
     * @returns {AccesBD} - instanta clasei AccesBD
     */
  static getInstanta({ init = "local" } = {}) {
    console.log(this); //this-ul e clasa nu instanta pt ca metoda statica
    if (!this.#instanta) {
      this.#initializat = true;
      this.#instanta = new AccesBD();

      //initializarea poate arunca erori
      //vom adauga aici cazurile de initializare
      //pentru baza de date cu care vrem sa lucram
      try {
        switch (init) {
          case "local":
            this.#instanta.initLocal();
        }
        //daca ajunge aici inseamna ca nu s-a produs eroare la initializare
      } catch (e) {
        console.error("Eroare la initializarea bazei de date!");
      }
    }
    return this.#instanta;
  }

  /**
   * @typedef {object} ObiectQuerySelect - obiect primit de functiile care realizeaza un query
   * @property {string} tabel - numele tabelului
   * @property {string []} campuri - o lista de stringuri cu numele coloanelor afectate de query; poate cuprinde si elementul "*"
   * @property {string[]} conditiiAnd - lista de stringuri cu conditiiAnd pentru where
   */

  /**
   * callback pentru queryuri.
   * @callback QueryCallBack
   * @param {Error} err Eventuala eroare in urma queryului
   * @param {Object} rez Rezultatul query-ului
   */
  /**
   * Selecteaza inregistrari din baza de date
   *
   * @param {ObiectQuerySelect} obj - un obiect cu datele pentru query
   * @param {QueryCallBack} callback - o functie callback cu 2 parametri: eroare si rezultatul queryului
   */
  select(
    { tabel = "", campuri = [], conditiiAnd = [] } = {},
    callback,
    parametriQuery = []
  ) {
    let conditieWhere = "";
    if (conditiiAnd.length > 0){
      conditieWhere = "where ";
      conditiiAnd.forEach((grup, index) => {
        if (index > 0) conditieWhere += " or ";
        conditieWhere += "(" + grup.join(" and ") + ")";
      });
    }
    let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
    console.error(comanda);
    /*
        comanda=`select id, camp1, camp2 from tabel where camp1=$1 and camp2=$2;
        this.client.query(comanda,[val1, val2],callback)

        */
    this.client.query(comanda, parametriQuery, callback);
  }

  /**
   * Selecteaza inregistrari din baza de date folosind async/await
   *
   * @param {ObiectQuerySelect} obj - un obiect cu datele pentru query
   * @returns {Promise<Object|null>} - rezultatul queryului sau null in caz de eroare
   */
  async selectAsync({ tabel = "", campuri = [], conditiiAnd = [] } = {}) {
    let conditieWhere = "";
    if (conditiiAnd.length > 0)
      conditieWhere = `where ${conditiiAnd.join(" and ")}`;

    let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
    console.error("selectAsync:", comanda);
    try {
      let rez = await this.client.query(comanda);
      console.log("selectasync: ", rez);
      return rez;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  /**
   * Insereaza inregistrari in baza de date
   *
   * @param {Object} obj - un obiect cu datele pentru query
   * @param {string} obj.tabel - numele tabelului
   * @param {Object} obj.campuri - un obiect cu perechi cheie-valoare reprezentand coloanele si valorile de inserat
   * @param {QueryCallBack} callback - o functie callback cu 2 parametri: eroare si rezultatul queryului
   */
  insert({ tabel = "", campuri = {} } = {}, callback) {
    /*
        campuri={
            nume:"savarina",
            pret: 10,
            calorii:500
        }
        */
    console.log("-------------------------------------------");
    console.log(Object.keys(campuri).join(","));
    console.log(Object.values(campuri).join(","));
    let comanda = `insert into ${tabel}(${Object.keys(campuri).join(
      ","
    )}) values ( ${Object.values(campuri)
      .map((x) => `'${x}'`)
      .join(",")})`;
    console.log(comanda);
    this.client.query(comanda, callback);
  }

  /**
   * @typedef {object} ObiectQuerySelect - obiect primit de functiile care realizeaza un query
   * @property {string} tabel - numele tabelului
   * @property {string []} campuri - o lista de stringuri cu numele coloanelor afectate de query; poate cuprinde si elementul "*"
   * @property {string[]} conditiiAnd - lista de stringuri cu conditiiAnd pentru where
   */
  // update({tabel="",campuri=[],valori=[], conditiiAnd=[]} = {}, callback, parametriQuery){
  //     if(campuri.length!=valori.length)
  //         throw new Error("Numarul de campuri difera de nr de valori")
  //     let campuriActualizate=[];
  //     for(let i=0;i<campuri.length;i++)
  //         campuriActualizate.push(`${campuri[i]}='${valori[i]}'`);
  //     let conditieWhere="";
  //     if(conditiiAnd.length>0)
  //         conditieWhere=`where ${conditiiAnd.join(" and ")}`;
  //     let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
  //     console.log(comanda);
  //     this.client.query(comanda,callback)
  // }

  update(
    { tabel = "", campuri = {}, conditiiAnd = [] } = {},
    callback,
    parametriQuery
  ) {
    let campuriActualizate = [];
    for (let prop in campuri)
      campuriActualizate.push(`${prop}='${campuri[prop]}'`);

    let conditieWhere = "";
    if (conditiiAnd.length > 0) {
      conditieWhere = "where ";
      conditiiAnd.forEach((grup, index) => {
        if (index > 0) conditieWhere += " or ";
        conditieWhere += "(" + grup.join(" and ") + ")";
      });
    }

    let comanda = `update ${tabel} set ${campuriActualizate.join(
      ", "
    )} ${conditieWhere}`;
    console.log(comanda);
    this.client.query(comanda, callback);
  }

  /**
   * Actualizeaza inregistrari in baza de date folosind parametri
   *
   * @param {Object} obj - un obiect cu datele pentru query
   * @param {string} obj.tabel - numele tabelului
   * @param {string[]} obj.campuri - lista de coloane de actualizat
   * @param {Array} obj.valori - lista de valori corespunzătoare coloanelor de actualizat
   * @param {string[]} obj.conditiiAnd - lista de stringuri cu conditiiAnd pentru where
   * @param {QueryCallBack} callback - o functie callback cu 2 parametri: eroare si rezultatul queryului
   */
  updateParametrizat(
    { tabel = "", campuri = [], valori = [], conditiiAnd = [] } = {},
    callback,
    parametriQuery
  ) {
    if (campuri.length != valori.length)
      throw new Error("Numarul de campuri difera de nr de valori");
    let campuriActualizate = [];
    for (let i = 0; i < campuri.length; i++)
      campuriActualizate.push(`${campuri[i]}=$${i + 1}`);
    let conditieWhere = "";
    if (conditiiAnd.length > 0)
      conditieWhere = `where ${conditiiAnd.join(" and ")}`;
    let comanda = `update ${tabel} set ${campuriActualizate.join(
      ", "
    )}  ${conditieWhere}`;
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111", comanda);
    this.client.query(comanda, valori, callback);
  }

  //TO DO
  // updateParametrizat({tabel="",campuri={}, conditiiAnd=[]} = {}, callback, parametriQuery){
  //     let campuriActualizate=[];
  //     for(let prop in campuri)
  //         campuriActualizate.push(`${prop}='${campuri[prop]}'`);
  //     let conditieWhere="";
  //     if(conditiiAnd.length>0)
  //         conditieWhere=`where ${conditiiAnd.join(" and ")}`;
  //     let comanda=`update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
  //     this.client.query(comanda,valori, callback)
  // }

  /**
   * Sterge înregistrări din baza de date.
   *
   * @param {Object} obj - un obiect cu datele pentru query
   * @param {string} obj.tabel - numele tabelului
   * @param {string[]} obj.conditiiAnd - lista de stringuri cu conditiiAnd pentru where
   * @param {QueryCallBack} callback - o functie callback cu 2 parametri: eroare si rezultatul queryului
   */
  delete({ tabel = "", conditiiAnd = [] } = {}, callback) {
    let conditieWhere = "";
    if (conditiiAnd.length > 0) {
      conditieWhere = "where ";
      conditiiAnd.forEach((grup, index) => {
        if (index > 0) conditieWhere += " or ";
        conditieWhere += "(" + grup.join(" and ") + ")";
      });
    }
    let comanda = `delete from ${tabel} ${conditieWhere}`;
    console.log(comanda);
    this.client.query(comanda, callback);
  }

  query(comanda, callback) {
    this.client.query(comanda, callback);
  }
}

module.exports=AccesBD;