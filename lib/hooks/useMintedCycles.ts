import { useQuery } from "react-query";
import fetchJSON from "../fetch";

type CyclesMintedCount = {
  day: string;
  minted: string;
  id: string;
};

export default function useMintedCycles() {
  return useQuery<CyclesMintedCount[]>(
    "cycles/minted",
    () => fetchJSON("/api/cycles/minted"),
    {
      staleTime: Infinity,
      placeholderData: [],
    }
  );
}
