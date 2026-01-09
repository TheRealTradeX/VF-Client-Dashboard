export type DataMode = "live" | "mock";

export function getDataMode(): DataMode {
  const raw =
    (process.env.VF_DATA_MODE ?? process.env.NEXT_PUBLIC_VF_DATA_MODE ?? "live")
      .trim()
      .toLowerCase();

  if (raw === "mock") return "mock";
  return "live";
}

