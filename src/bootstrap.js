// Keep a useful HTML fallback even if the application bundle fails to load.
function report(error) {
  console.error("Mini Motor: falha inesperada", error);
  let notice = document.querySelector("#startup-error");
  if (!notice) {
    notice = document.createElement("section");
    notice.id = "startup-error";
    notice.setAttribute("role", "alert");
    notice.style.cssText =
      "position:relative;z-index:20;margin:24px;padding:24px;background:#f7f5ef;color:#293a37;border:1px solid #ba252b;font:16px system-ui";
    notice.textContent =
      "Não foi possível concluir o carregamento do Mini Motor. Recarregue a página e verifique sua conexão. Se o problema continuar, consulte o console do navegador.";
    document.body.prepend(notice);
  }
}
window.addEventListener("error", (event) => {
  if (event.error) report(event.error);
});
window.addEventListener("unhandledrejection", (event) => report(event.reason));
import("./main.js").catch(report);
