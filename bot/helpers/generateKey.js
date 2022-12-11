import { knex } from "../../src/models/index.js";

export const generateKey = async () => {
  const defaultCount = 3;

  const packs = {
    abc: "ABCDEFGHIJKLMNPQRSTUVWXYZ",
    num: "123456789",
  };

  const gen = (c, s) => [...Array(c).keys()].map(() => s[Math.floor(Math.random() * s.length)]).join("");

  const key = gen(defaultCount, packs.abc) + "-" + gen(defaultCount, packs.num);

  const isExists = await knex("rooms").where({ key }).first();

  return isExists ? getVoucher() : key;
};
