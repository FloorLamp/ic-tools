import { Actor, Certificate, HttpAgent } from "@dfinity/agent";
import { blobFromText, blobFromUint8Array } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import cbor from "borc";
import { Bindings } from "didc";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import CandidService from "../canisters/get-candid.did";
import fetchJSON from "../fetch";
import { Canister } from "../types/API";
import { PrincipalType } from "../types/PrincipalType";

const didc = import("didc");

const agent = new HttpAgent({ host: "https://ic0.app" });

const decoder = new cbor.Decoder({
  tags: {
    55799: (val: any) => val,
  },
} as any);

export const useCandid = (principalId: string, type: PrincipalType | null) => {
  const router = useRouter();
  const [candid, setCandid] = useState("");
  const [bindings, setBindings] = useState<Bindings | null>(null);
  const [protobuf, setProtobuf] = useState("");

  const { candid: candidOverride } = router.query as {
    candid?: string;
  };

  const { data: canisterData } = useQuery<Canister>(
    ["canisters", principalId],
    () => fetchJSON(`/api/canisters/${principalId}`),
    {
      enabled: type === "Canister",
    }
  );

  const setCandidAndBindings = useCallback(
    (newCandid: string) => {
      if (newCandid === candid) {
        return;
      }

      setCandid(newCandid);
      if (newCandid) {
        didc.then((mod) => {
          const gen = mod.generate(newCandid);
          if (gen) {
            setBindings(gen);
          } else {
            console.warn("failed to generate bindings");
            console.log(newCandid);
          }
        });
      } else {
        setBindings(null);
      }
    },
    [candid]
  );

  useEffect(() => {
    let newCandid = "";
    if (candidOverride) {
      try {
        newCandid = window.atob(candidOverride);
      } catch (error) {
        console.warn("invalid candid attached");
      }
    }
    setCandidAndBindings(newCandid);
    setProtobuf("");
    // this causes an infinite loop if we updated the dependecies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principalId, candidOverride]);

  useEffect(() => {
    // Try fetching candid if not available
    if (candid || type !== "Canister") return;

    (async () => {
      const actor = Actor.createActor(CandidService, {
        agent,
        canisterId: principalId,
      });

      try {
        const foundCandid =
          (await actor.__get_candid_interface_tmp_hack()) as string;
        console.log("candid loaded from endpoint");
        setCandidAndBindings(foundCandid);
        if (candid && foundCandid.trim() !== candid.trim()) {
          console.log("candid from endpoint is different from state!");
          console.log("endpoint", foundCandid);
          console.log("state", candid);
        }
      } catch (error) {
        console.warn("no candid found");
      }
    })();
  }, [principalId, candid, type, setCandidAndBindings]);

  useEffect(() => {
    if (!canisterData) return;

    /** Read from state to verify data integrity */
    const checkState = async () => {
      const principal = blobFromUint8Array(
        Principal.fromText(principalId).toUint8Array()
      );
      const pathCommon = [blobFromText("canister"), principal];
      const pathModuleHash = pathCommon.concat(blobFromText("module_hash"));
      const pathControllers = pathCommon.concat(blobFromText("controllers"));
      const agent = new HttpAgent({ host: "https://ic0.app" });
      let res;
      try {
        res = await agent.readState(principalId, {
          paths: [pathModuleHash, pathControllers],
        });
      } catch (error) {
        if (res) {
          console.log(res);
        }
        console.warn("read_state:", error);
        return;
      }
      const cert = new Certificate(res, agent);
      if (await cert.verify()) {
        const subnet = cert["cert"].delegation
          ? Principal.fromUint8Array(cert["cert"].delegation.subnet_id).toText()
          : null;
        if (subnet) {
          if (subnet !== canisterData.subnetId) {
            console.warn(
              `subnet: api=${canisterData.subnetId} state=${subnet}`
            );
          }
        } else {
          console.warn("state: no subnet");
        }
        const certControllers = cert.lookup(pathControllers);
        if (certControllers) {
          const certControllerIds = decoder
            .decodeFirst(certControllers)
            .map((buf: Buffer) => Principal.fromUint8Array(buf).toText());
          const certControllersSet = new Set(certControllerIds);
          const apiControllerIds = canisterData.controllers.map(({ id }) => id);

          if (
            !(
              certControllersSet.size === apiControllerIds.length &&
              apiControllerIds.every((id) => certControllersSet.has(id))
            )
          ) {
            console.warn(
              `controllers: api=${apiControllerIds} state=${certControllerIds}`
            );
          }
        } else {
          console.warn("state: no controllers");
        }
        const moduleHash = cert.lookup(pathModuleHash)?.toString("hex");
        if (moduleHash && canisterData.module?.id !== moduleHash) {
          console.warn(
            `moduleHash: api=${canisterData.module?.id} state=${moduleHash}`
          );
        }
      } else {
        console.warn("state: unable to verify cert", cert);
      }
    };
    checkState();

    /** Try to fetch local interface file(s) */
    const fetchLocalFiles = async () => {
      if (canisterData.principal?.name && !candidOverride) {
        fetch(`/data/interfaces/${canisterData.principal.name}.did`)
          .then((res) => {
            if (!res.ok) {
              throw res.statusText;
            }
            return res.text();
          })
          .then((data) => {
            console.log("candid loaded from file");
            setCandidAndBindings(data);
          })
          .catch(() => {
            console.warn("failed to load candid from file");
          });

        fetch(`/data/interfaces/${canisterData.principal.name}.proto`)
          .then((res) => {
            if (!res.ok) {
              throw res.statusText;
            }
            return res.text();
          })
          .then((data) => {
            setProtobuf(data);
          })
          .catch(() => {
            console.warn("failed to load protobuf from file");
          });
      }
    };

    /** If candid isn't available, try to fetch from local */
    if (canisterData.module?.candid) {
      console.log("candid in api");
      setCandidAndBindings(canisterData.module.candid);
    } else {
      fetchLocalFiles();
    }
  }, [candidOverride, canisterData, principalId, setCandidAndBindings]);

  return {
    candid,
    bindings,
    protobuf,
    candidOverride,
  };
};
