
const Drepturi=require('./drepturi.js');

/**
 * Reprezinta un rol generic
 * @class
 */
class Rol{
    /**
     * @returns {string} Tipul rolului
     */
    static get tip() {return "generic"}

    /**
     * @returns {Symbol[]} Drepturile asociate rolului
     */
    static get drepturi() {return []}

    constructor (){
        this.cod=this.constructor.tip;
    }

    /**
     * Verifica daca rolul are un anumit drept
     * @param {Symbol} drept - Dreptul de verificat
     * @returns {boolean} True daca rolul are dreptul, altfel false
     */
    areDreptul(drept){ //drept trebuie sa fie tot Symbol
        console.log("in metoda rol!!!!")
        return this.constructor.drepturi.includes(drept); //pentru ca e admin
    }
}

/**
 * Reprezinta rolul de admin
 * @class
 * @extends Rol
 */
class RolAdmin extends Rol{
    /**
     * @returns {string} Tipul rolului
     */
    static get tip() {return "admin"}
    constructor (){
        super();
    }

    /**
     * Verifica daca rolul are un anumit drept
     * @returns {boolean} True daca rolul are dreptul, altfel false
     */
    areDreptul(){
        return true; //pentru ca e admin
    }
}

/**
 * Reprezinta rolul de moderator
 * @class
 * @extends Rol
 */
class RolModerator extends Rol{
    /**
     * @returns {string} Tipul rolului
     */
    static get tip() {return "moderator"}

    /**
     * @returns {Symbol[]} Drepturile asociate rolului
     */
    stat
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori
    ] }
    constructor (){
        super()
    }
}

/**
 * Reprezinta rolul de moderator
 * @class
 * @extends Rol
 */
class RolClient extends Rol{
    /**
     * @returns {string} Tipul rolului
     */
    static get tip() {return "comun"}

    /**
     * @returns {Symbol[]} Drepturile asociate rolului
     */
    static get drepturi() { return [
        Drepturi.cumparareProduse
    ] }
    constructor (){
        super()
    }
}

/**
 * Clasa factory pentru crearea de roluri
 * @class
 */
class RolFactory{
    /**
     * Creeaza un rol pe baza tipului specificat
     * @param {string} tip - Tipul rolului
     * @returns {Rol} Rolul creat
     */
    static creeazaRol(tip) {
        switch(tip){
            case RolAdmin.tip : return new RolAdmin();
            case RolModerator.tip : return new RolModerator();
            case RolClient.tip : return new RolClient();
        }
    }
}


module.exports={
    RolFactory:RolFactory,
    RolAdmin:RolAdmin
}