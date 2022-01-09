let filterCookie;

$(document).ready(function () {
  new URLSearchParams(window.location.search).forEach((value, key) => {
    //populate selected select box
    if (key.includes("sortBy")) {
      $(`select[name="sortBy"] option:contains(${value})`).prop({
        selected: true,
      });
    }

    //populate checkbox brands & colors list
    if (key.includes("brand")) {
      $(
        `div.card-body input[type='checkbox'][name='brand'][value="${value}"]`
      ).prop({
        checked: true,
      });
    }
    if (key.includes("color")) {
      $(
        `div.card-body input[type='checkbox'][name='color'][value="${value}"]`
      ).prop({
        checked: true,
      });
    }
  });

  //clear checked checkbox
  $("a").click(function (e) {
    if (e.target.closest(".btn-danger")?.classList.contains("btn-danger")) {
      e.preventDefault();
      $(`div.card-body input[type='checkbox'][name='${this.id}']`).prop({
        checked: false,
      });
    }
  });
  populateSelected();
});

function populateSelected() {
  if ($.cookie("filter")) {
    filterCookie = JSON.parse($.cookie("filter").slice(2));
  }
  console.log(filterCookie);
  for (const key in filterCookie) {
    if (filterCookie.hasOwnProperty(key)) {
      const element = filterCookie[key];
      $(`#form-search select[name='${key}']`).val(`${element}`).change();
    }
  }
}
