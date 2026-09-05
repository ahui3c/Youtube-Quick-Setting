"use strict";

try { importScripts("build-info.js", "instance-coordinator.js"); } catch {}

const ytqsExtensionApi = globalThis.chrome || globalThis.browser;
const ytqsCoordinator = globalThis.YTQSInstanceCoordinator;
const ytqsOwnInstance = Object.freeze({
  extensionId: String(ytqsExtensionApi?.runtime?.id || ""),
  version: String(ytqsExtensionApi?.runtime?.getManifest?.().version || "0.0.0"),
  distribution: ytqsCoordinator?.classifyDistribution(ytqsExtensionApi?.runtime?.id, globalThis.YTQS_BUILD?.distribution) || "unknown"
});
let ytqsInstanceConflict = null;

function ytqsExternalInstanceInfo(extensionId) {
  return new Promise((resolve) => {
    if (!ytqsCoordinator?.validExtensionId(extensionId) || extensionId === ytqsOwnInstance.extensionId) {
      resolve(null);
      return;
    }
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value || null);
    };
    try {
      if (globalThis.browser && !globalThis.chrome) {
        ytqsExtensionApi.runtime.sendMessage(extensionId, {
          type: "YTQS_INSTANCE_INFO",
          product: ytqsCoordinator.PRODUCT,
          protocolVersion: ytqsCoordinator.PROTOCOL_VERSION
        }).then(finish).catch(() => finish(null));
      } else {
        const pending = ytqsExtensionApi.runtime.sendMessage(extensionId, {
          type: "YTQS_INSTANCE_INFO",
          product: ytqsCoordinator.PRODUCT,
          protocolVersion: ytqsCoordinator.PROTOCOL_VERSION
        }, (response) => finish(ytqsExtensionApi.runtime.lastError ? null : response));
        if (pending?.then) pending.then(finish).catch(() => finish(null));
      }
    } catch {
      finish(null);
    }
  });
}

async function ytqsBroadcastConflict() {
  try {
    const tabs = await ytqsExtensionApi.tabs.query({ url: "https://www.youtube.com/*" });
    await Promise.allSettled((tabs || []).filter((tab) => Number.isInteger(tab.id)).map((tab) =>
      ytqsExtensionApi.tabs.sendMessage(tab.id, { type: "YTQS_INSTANCE_CONFLICT", conflict: ytqsInstanceConflict })
    ));
  } catch {}
}

async function ytqsUpdateActionState() {
  const conflict = ytqsInstanceConflict?.active;
  try {
    await Promise.allSettled([
      ytqsExtensionApi.action.setBadgeText({ text: conflict ? "OLD" : "" }),
      ytqsExtensionApi.action.setBadgeBackgroundColor({ color: conflict ? "#c04b3f" : "#7a8288" }),
      ytqsExtensionApi.action.setTitle({ title: conflict
        ? `YouTube 快速設定工具箱：另一個優先版本 v${ytqsInstanceConflict.winnerVersion} 已接管`
        : "YouTube 快速設定工具箱" })
    ]);
  } catch {}
}

async function ytqsSetInstanceConflict(conflict) {
  ytqsInstanceConflict = conflict || null;
  await ytqsUpdateActionState();
  await ytqsBroadcastConflict();
}

async function ytqsEvaluatePeer(extensionId) {
  if (!ytqsCoordinator || !ytqsCoordinator.validExtensionId(ytqsOwnInstance.extensionId)) return null;
  const peer = await ytqsExternalInstanceInfo(extensionId);
  const validPeer = peer
    && peer.product === ytqsCoordinator.PRODUCT
    && peer.protocolVersion === ytqsCoordinator.PROTOCOL_VERSION
    && peer.extensionId === extensionId
    && ytqsCoordinator.validExtensionId(peer.extensionId);
  if (!validPeer) {
    if (ytqsInstanceConflict?.winnerExtensionId === extensionId) await ytqsSetInstanceConflict(null);
    return ytqsInstanceConflict;
  }
  const winner = ytqsCoordinator.preferredInstance(ytqsOwnInstance, peer);
  if (winner.extensionId !== ytqsOwnInstance.extensionId) {
    await ytqsSetInstanceConflict({
      active: true,
      winnerExtensionId: peer.extensionId,
      winnerVersion: peer.version,
      winnerDistribution: peer.distribution,
      currentVersion: ytqsOwnInstance.version,
      currentDistribution: ytqsOwnInstance.distribution,
      reason: ytqsCoordinator.compareVersions(peer.version, ytqsOwnInstance.version) > 0
        ? "newer-version"
        : peer.distribution === ytqsCoordinator.DEVELOPMENT_DISTRIBUTION
          && ytqsOwnInstance.distribution === ytqsCoordinator.CHROME_STORE_DISTRIBUTION
          ? "same-version-development-priority"
          : "same-version-tiebreak"
    });
  } else if (ytqsInstanceConflict?.winnerExtensionId === peer.extensionId) {
    await ytqsSetInstanceConflict(null);
  }
  return ytqsInstanceConflict;
}

if (ytqsCoordinator && ytqsCoordinator.validExtensionId(ytqsOwnInstance.extensionId)
  && ytqsExtensionApi.runtime.onMessageExternal?.addListener) {
  ytqsExtensionApi.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message?.type !== "YTQS_INSTANCE_INFO"
      || message.product !== ytqsCoordinator.PRODUCT
      || message.protocolVersion !== ytqsCoordinator.PROTOCOL_VERSION
      || !ytqsCoordinator.validExtensionId(sender?.id)
      || sender.id === ytqsOwnInstance.extensionId) return false;
    sendResponse({
      product: ytqsCoordinator.PRODUCT,
      protocolVersion: ytqsCoordinator.PROTOCOL_VERSION,
      extensionId: ytqsOwnInstance.extensionId,
      version: ytqsOwnInstance.version,
      distribution: ytqsOwnInstance.distribution
    });
    return false;
  });
}

ytqsExtensionApi.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "YTQS_INSTANCE_PEER") {
    ytqsEvaluatePeer(String(message.extensionId || ""))
      .then((conflict) => sendResponse({ ok: true, conflict }))
      .catch((error) => sendResponse({ ok: false, message: String(error?.message || error) }));
    return true;
  }
  if (message?.type === "YTQS_INSTANCE_CONFLICT_STATUS") {
    sendResponse({ ok: true, conflict: ytqsInstanceConflict, instance: ytqsOwnInstance });
    return false;
  }
  return false;
});

void ytqsUpdateActionState();
