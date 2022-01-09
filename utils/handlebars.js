const helpers = {
  extractParams(anObject) {
    if (!anObject) return "";
    return Object.keys(anObject)
      .map((key) => {
        if (Array.isArray(anObject[key])) {
          return `${key}=${anObject[key].join(`&${key}=`)}`;
        }
        if (key !== "page") return `${key}=${anObject[key]}`;
      })
      .join("&");
  },
  calcTotal(price, quantity) {
    return (price * quantity).toFixed(2);
  },
  equals(a, b) {return (a === b)},
};

module.exports.helpers = helpers;
