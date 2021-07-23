$(document).ready(() => {
  $("a.sidebar--item").on("click", (e) => {
    const active = $(".sidebar a.active");
    const newActive = e.target;

    $(active).removeClass("active");
    $(`.${active.html().toLowerCase()}`).addClass("hidden");
    $(newActive).addClass("active");
    $(`.${$(newActive).html().toLowerCase()}`).removeClass("hidden");
  });
});
