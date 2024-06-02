import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useQuery } from "react-query";
import CandidUI from "../../components/CandidUI";
import { CanistersTable } from "../../components/CanistersTable";
import NetworkGraph from "../../components/Charts/NetworkGraph";
import CodeBlock from "../../components/CodeBlock";
import GenesisAccount from "../../components/GenesisAccount";
import { MetaTags } from "../../components/MetaTags";
import { SecondaryTab } from "../../components/Nav/SecondaryTabs";
import { Tabs } from "../../components/Nav/Tabs";
import PrincipalDetails from "../../components/PrincipalDetails";
import { PrincipalNodesTable } from "../../components/PrincipalNodesTable";
import Search404 from "../../components/Search404";
import fetchJSON from "../../lib/fetch";
import { useCandid } from "../../lib/hooks/useCandid";
import { useTabs } from "../../lib/hooks/useTabs";
import { getPrincipalType } from "../../lib/identifiers";
import { APIPrincipal, Canister } from "../../lib/types/API";
import { PrincipalType } from "../../lib/types/PrincipalType";

export async function getServerSideProps({ params }) {
  const { principalId } = params;
  return { props: { type: getPrincipalType(principalId), principalId } };
}

export enum PrincipalTabId {
  GenesisAccount = "Genesis Accounts",
  Network = "Network",
  CanisterInterface = "Canister Interface",
  ControlledCanisters = "Controlled Canisters",
  CAPTransactions = "CAP Transactions",
}

export enum CandidSecondaryTabId {
  Interface = "Interface",
  Code = "Code",
}

const PrincipalPage = ({
  principalId,
  type,
}: {
  principalId: string;
  type: PrincipalType | null;
}) => {
  const router = useRouter();

  const [tabs, handleTabChange, addTab, removeTab] = useTabs<PrincipalTabId>();
  const [
    candidSecondaryTabs,
    handleCandidSecondaryTabChange,
    addCandidSecondaryTab,
    removeCandidSecondaryTab,
  ] = useTabs<CandidSecondaryTabId>();
  const { bindings, candid, candidOverride, protobuf } = useCandid(
    principalId,
    type
  );

  const { data: canisterData } = useQuery<Canister>(
    ["canisters", principalId],
    () => fetchJSON(`/api/canisters/${principalId}`),
    {
      enabled: type === "Canister",
    }
  );

  const { data: principalData } = useQuery<APIPrincipal>(
    ["principals", principalId],
    () => fetchJSON(`/api/principals/${principalId}`)
  );

  useEffect(() => {
    if (principalData?.node) {
      router.replace(`/node/${principalId}`);
    }
  }, [principalData, principalId, router]);

  useEffect(() => {
    if (
      principalData?.operatorOf.length > 0 ||
      principalData?.providerOf.length > 0
    ) {
      addTab(PrincipalTabId.Network);
    } else {
      removeTab(PrincipalTabId.Network);
    }
    if (principalData?.canisterCount > 0) {
      addTab(
        PrincipalTabId.ControlledCanisters,
        principalData?.canisterCount.toString()
      );
    } else {
      removeTab(PrincipalTabId.ControlledCanisters);
    }
    if (principalData?.genesisAccount?.id) {
      addTab(PrincipalTabId.GenesisAccount);
    } else {
      removeTab(PrincipalTabId.GenesisAccount);
    }
  }, [addTab, principalData, removeTab]);

  useEffect(() => {
    if (candid) {
      addTab(PrincipalTabId.CanisterInterface);
      addCandidSecondaryTab(CandidSecondaryTabId.Code);
      if (bindings) {
        addCandidSecondaryTab(CandidSecondaryTabId.Interface);
      }
    } else {
      removeTab(PrincipalTabId.CanisterInterface);
      removeCandidSecondaryTab(CandidSecondaryTabId.Interface);
      removeCandidSecondaryTab(CandidSecondaryTabId.Code);
    }
  }, [
    candid,
    bindings,
    addTab,
    addCandidSecondaryTab,
    removeTab,
    removeCandidSecondaryTab,
  ]);

  if (!type) {
    return <Search404 input={principalId} />;
  }

  return (
    <div className="pb-16">
      <MetaTags
        title={`Principal ${principalId}`}
        description={`Details for principal ${principalId} on the Internet Computer.`}
      />
      <h1 className="overflow-hidden my-8 text-3xl overflow-ellipsis">
        Principal <small className="text-xl">{principalId}</small>
      </h1>
      <PrincipalDetails
        principalId={principalId}
        type={type}
        principalData={principalData}
        canisterData={canisterData}
        className="mb-8"
      />
      {tabs.length > 0 ? (
        <div className="mb-8">
          <Tabs handleTabChange={handleTabChange} tabs={tabs} />
        </div>
      ) : null}

      {tabs.map((tab) => {
        switch (tab.name) {
          case PrincipalTabId.GenesisAccount:
            return (
              tab.current &&
              principalData?.genesisAccount && (
                <GenesisAccount
                  genesisAccount={principalData.genesisAccount.id}
                  key={tab.name}
                />
              )
            );
          case PrincipalTabId.Network:
            return (
              (tab.current && principalData?.operatorOf.length > 0) ||
              (principalData?.providerOf.length > 0 && (
                <div key={tab.name}>
                  <NetworkGraph activeId={principalId} activeType="Principal" />
                  <PrincipalNodesTable data={principalData} />
                </div>
              ))
            );
          case PrincipalTabId.CanisterInterface:
            return (
              tab.current && (
                <section key={tab.name}>
                  <h2 className="mb-4 text-2xl">Canister Interface</h2>
                  <div className="mb-8">
                    <SecondaryTab
                      tabs={candidSecondaryTabs}
                      handleTabChange={handleCandidSecondaryTabChange}
                    />
                  </div>
                  {candidSecondaryTabs.map((secondaryTab) => {
                    switch (secondaryTab.name) {
                      case CandidSecondaryTabId.Interface:
                        return (
                          secondaryTab.current && (
                            <CandidUI
                              key={principalId}
                              candid={candid}
                              canisterId={principalId}
                              jsBindings={bindings.js}
                              protobuf={protobuf}
                              className="mb-8"
                              isAttached={!!candidOverride}
                            />
                          )
                        );
                      case CandidSecondaryTabId.Code:
                        return (
                          secondaryTab.current && (
                            <CodeBlock
                              key={tab.name}
                              candid={candid}
                              bindings={bindings}
                              protobuf={protobuf}
                            />
                          )
                        );
                    }
                  })}
                </section>
              )
            );
          case PrincipalTabId.ControlledCanisters:
            return (
              tab.current && (
                <section key={tab.name} className="mb-8">
                  <h2 className="mb-4 text-2xl">Controlled Canisters</h2>
                  <CanistersTable
                    name="controlled-canisters"
                    controllerId={principalId}
                  />
                </section>
              )
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default PrincipalPage;
