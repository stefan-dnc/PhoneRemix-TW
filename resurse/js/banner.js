document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("banner");
  const acceptButton = document.getElementById("acceptCookies");
  const cookieName = "bannerAccepted";

  function setCookie(name, value, timpExp) {
    const date = new Date();
    date.setDate(date.getTime() + timpExp * 24 * 60 * 60 * 1000);
    //date.setTime(date.getTime() + timpExp * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const cookiePos = cookie.indexOf("=");
      const name = cookiePos > -1 ? cookie.substr(0, cookiePos) : cookie;
      deleteCookie(name);
    }
  }

  const bannerAccepted = getCookie(cookieName);
  if (!bannerAccepted) {
    banner.style.animation = "bannerAnimation 5s forwards";
  }

  acceptButton.addEventListener("click", () => {
    setCookie(cookieName, "true", 7);
    banner.style.animation = "none";
    banner.style.opacity = "0";
  });

  setCookie("lastVisited", new Date().toISOString(), 7);

  console.log("Cookie:", getCookie("bannerAccepted"));

  console.log("Last Visited:", getCookie("lastVisited"));
});
