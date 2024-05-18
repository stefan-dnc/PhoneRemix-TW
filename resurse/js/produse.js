window.addEventListener("load", function () {
  document.getElementById("inp-pret").onchange = function () {
    document.getElementById("infoRange").innerHTML = `(${this.value})`;
  };

  document.getElementById("filtrare").onclick = function () {
    let val_nume = document.getElementById("inp-nume").value.toLowerCase();

    let radiobuttons = document.getElementsByName("gr_rad");
    let val_stocare;
    for (let r of radiobuttons) {
      if (r.checked) {
        val_stocare = r.value;
        break;
      }
    }

    var stocare_a, stocare_b;
    if (val_stocare != "toate") {
      [stocare_a, stocare_b] = val_stocare.split(":");
      stocare_a = parseInt(stocare_a);
      stocare_b = parseInt(stocare_b);
    }

    let val_pret = document.getElementById("inp-pret").value;

    let val_categ = document.getElementById("inp-categorie").value;

    var produse = document.getElementsByClassName("produs");

    let val_accesorii = document.getElementById("inp-accesorii").checked;

    for (let prod of produse) {
      prod.style.display = "none";
      let nume = prod.getElementsByClassName("val-model")[0].innerHTML.toLowerCase();

      let cond1 = nume.startsWith(val_nume);

      let stocare = parseInt(
        prod.getElementsByClassName("val-stocare")[0].innerHTML
      );

      let cond2 =
        val_stocare == "toate" || (stocare_a <= stocare && stocare <= stocare_b);

      let pret = parseFloat(
        prod.getElementsByClassName("val-pret")[0].innerHTML
      );

      let cond3 = pret >= val_pret;

      let categorie = prod.getElementsByClassName("val-categorie")[0].innerHTML;
      let cond4 = val_categ == "toate" || val_categ == categorie;

      let accesorii = prod.getElementsByClassName("val-accesorii")[0].innerHTML == "DA";
      let cond5 = val_accesorii == accesorii || !val_accesorii;

      if (cond1 && cond2 && cond3 && cond4 && cond5) {
        prod.style.display = "block";
      }
    }
  };

  document.getElementById("resetare").onclick = function () {
    document.getElementById("inp-nume").value = "";

    document.getElementById("inp-pret").value =
      document.getElementById("inp-pret").min;
    document.getElementById("inp-categorie").value = "toate";
    document.getElementById("i_rad4").checked = true;
    document.getElementById("inp-accesorii").checked = false;
    var produse = document.getElementsByClassName("produs");
    document.getElementById("infoRange").innerHTML = "(0)";
    for (let prod of produse) {
      prod.style.display = "block";
    }

    var produse = document.getElementsByClassName("produs");
    var v_produse = Array.from(produse);
    v_produse.sort(function (a, b) {
      let id_a = parseInt(a.id.split("_")[2]);
      let id_b = parseInt(b.id.split("_")[2]);
      return id_a - id_b;
    });
    for (let prod of v_produse) {
      prod.parentElement.appendChild(prod);
    }

  };
  function sortare(semn) {
    var produse = document.getElementsByClassName("produs");
    var v_produse = Array.from(produse);
    v_produse.sort(function (a, b) {
      let brand_a = a.getElementsByClassName("val-categorie")[0].innerHTML;
      let brand_b = b.getElementsByClassName("val-categorie")[0].innerHTML;
      if (brand_a == brand_b) {
        let pret_a = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML);
        let pret_b = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML);
        return semn * (pret_a - pret_b);
      }
      return semn * brand_a.localeCompare(brand_b);
    });
    for (let prod of v_produse) {
      prod.parentElement.appendChild(prod);
    }
  }
  document.getElementById("sortCrescNume").onclick = function () {
    sortare(1);
  };
  document.getElementById("sortDescrescNume").onclick = function () {
    sortare(-1);
  };

  document.getElementById("pretTotal").onclick = function () {
    if(document.getElementById("info-suma")) return;
    var produse=document.getElementsByClassName("produs");
    let suma=0;
    for (let prod of produse){
        if(prod.style.display!="none" && prod.getElementsByClassName("select-cos")[0].checked)
        {
            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML);
            suma+=pret;
        }
    }
    
    let p=document.createElement("p-suma");
    p.innerHTML=suma;
    p.id="info-suma";
    ps=document.getElementById("p-suma");
    container = ps.parentNode;
    frate=ps.nextElementSibling
    container.insertBefore(p, frate);
    setTimeout(function(){
        let info=document.getElementById("info-suma");
        if(info)
            info.remove();
    }, 1000)
  }
});
