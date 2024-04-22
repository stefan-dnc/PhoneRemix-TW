window.addEventListener("load", function() {

    this.document.getElementById("inp-pret").onchange = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    //console.log(document.getElementById("produse").innerHTML);
    this.document.getElementById("filtrare").addEventListener("click", function() {});
    this.document.getElementById("filtrare").onclick = function() {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim()

        var radioCalorii = document.getElementsByName("gr_rad")[0].value
        let inpCalorii;
        for(let rad of radioCalorii){
            if(rad.checked){
                inpCalorii = rad.value;
                break;
            }
        }

        let minCalorii, maxCalorii;
        if(inpCalorii != "toate"){
            vCal = inpCalorii.split(":")
            minCalorii = parseInt(vCal[0]);
            maxCalorii = parseInt(vCal[1]);
        }

        var inpPret = parseInt(document.getElementById("inp-pret").value)

        var inpCateg = document.getElementById("inp-categorie").value.toLowerCase().trim()

        var produse = document.getElementsByClassName("produs")

        for(let produs of produse)
        {
            let valNume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim()

            let cond1 = valNume.includes(inpNume);
            //let con1 = valNume.startsWith(inpNume);

            let valCalorii = parseInt(produs.getElementsByClassName("val-calorii")[0].innerHTML)

            let cond2 = (inpCalorii=="toate") || (valCalorii >= minCalorii && valCalorii <= maxCalorii);

            let valPret = parseInt(
              produs.getElementsByClassName("inp-pret")[0].innerHTML
            );

            let cond3 = valPret > inpPret;

            let valCategorie = produs.getElementsByClassName("val-categorie")[0].innerHTML.toLowerCase().trim()

            let cond4 = valCategorie.includes(inpCateg) || inpCateg == "toate";

            if(cond1 && cond2 && cond3 && cond4)
            {
                produs.style.display = "block";
            }
            else
            {
                produs.style.display = "none";
            }

        }
    };

    document.getElementById("resetare").onclick = function () {
      document.getElementById("inp-nume").value = "";

      document.getElementById("inp-pret").value =
        document.getElementById("inp-pret").min;
      document.getElementById("inp-categorie").value = "toate";
      document.getElementById("i_rad4").checked = true;
      var produse = document.getElementsByClassName("produs");
      document.getElementById("infoRange").innerHTML = "(0)";
      for (let prod of produse) {
        prod.style.display = "block";
      }
    };
});

//window.addEventListener("keypress", function() {});
//window.addEventListener("input", function() {});