import { extend } from "@pixi/react";
import { BlurFilter, Container, Graphics } from "pixi.js";
import { GlowFilter } from "pixi-filters";

let isRegistered = false;

export function ensurePixiElements() {
  if (isRegistered) {
    return;
  }

  extend({
    Container,
    Graphics,
    BlurFilter,
    GlowFilter,
  });

  isRegistered = true;
}
