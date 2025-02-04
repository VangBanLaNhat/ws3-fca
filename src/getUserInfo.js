"use strict";

const utils = require("../utils");
// Fixed by @NethWs3Dev
function formatData(data) {
  const retObj = {};
  for (const prop in data) {
    // eslint-disable-next-line no-prototype-builtins
    if (data.hasOwnProperty(prop)) {
      const innerObj = data[prop];
      retObj[prop] = {
        name: innerObj.name,
        firstName: innerObj.firstName,
        vanity: innerObj.vanity,
        thumbSrc: innerObj.thumbSrc,
        profileUrl: innerObj.uri,
        gender: innerObj.gender,
        type: innerObj.type,
        isFriend: innerObj.is_friend,
        isBirthday: !!innerObj.is_birthday,
        searchTokens: innerObj.searchTokens,
        alternateName: innerObj.alternateName
      };
    } else {
      retObj[prop] = {
        name: "Facebook User",
        firstName: "Facebook",
        vanity: prop,
        thumbSrc: "https://i.imgur.com/xPiHPW9.jpeg",
        profileUrl: `https://www.facebook.com/profile.php?id=${prop}`,
        gender: "[unknown-gender]",
        type: "acc",
        isFriend: false,
        isBirthday: false,
        searchTokens: [],
        alternateName: ""
      }
    }
  }
  return retObj;
}

module.exports = (defaultFuncs, api, ctx) => {
  return (id, callback) => {
    let resolveFunc = () => {};
    let rejectFunc = () => {};
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });
    if (!callback) {
      callback = (err, data) => {
        if (err) {
          return rejectFunc(err);
        }
        resolveFunc(data);
      };
    }
    if (utils.getType(id) !== "Array") {
      id = [id];
    }
    const form = {};
    id.map((v, i) => {
      form[`ids[${i}]`] = v;
    });
    defaultFuncs
      .post("https://www.facebook.com/chat/user_info/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData?.error && resData?.error !== 3252001) throw resData;
        return callback(null, formatData(resData?.payload?.profiles ?? id));
      })
      .catch(err => {
        utils.error("getUserInfo", err);
        return callback(err);
      });

    return returnPromise;
  }
};