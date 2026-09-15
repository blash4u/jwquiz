// data.js
import { familyData } from "./data_family.js";
import { trialsData } from "./data_trials.js";
import { livingData } from "./data_living.js";
import { conductData } from "./data_conduct.js";
import { congregationData } from "./data_congregation.js";
import { spiritualityData } from "./data_spirituality.js";
import { traitsData } from "./data_traits.js";

export const quizData = [
  ...familyData,
  ...trialsData,
  ...livingData,
  ...conductData,
  ...congregationData,
  ...spiritualityData,
  ...traitsData
];