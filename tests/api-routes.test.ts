import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { resetHandprintDatabaseCache } from "../lib/server/database";
import { GET as getProfile, POST as postProfile } from "../app/api/profile/route";
import { PATCH as patchProfileQr } from "../app/api/profile/qr/route";
import { GET as getShareCard } from "../app/api/share-card/route";
import { GET as getSocialLedger, POST as postSocialLedger } from "../app/api/social/route";
import { GET as getMobileProfile, POST as postMobileProfile } from "../app/api/mobile/profile/route";
import { GET as getMobileWorldChangers, POST as postMobileWorldChangers } from "../app/api/mobile/world-changers/route";
import { GET as getMobileBadges } from "../app/api/mobile/badges/route";
import { GET as getMobileBadgeDetail } from "../app/api/mobile/badges/[badgeId]/route";
import { GET as getMobileRewards } from "../app/api/mobile/rewards/route";
import { GET as getMobileRewardDetail } from "../app/api/mobile/rewards/[rewardId]/route";
import { GET as getMobileTrainingCredentials } from "../app/api/mobile/training-credentials/route";

test("social API supports preferences, templates, notifications, and report resolution", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "handprint-api-db-"));
  process.env.HANDPRINT_DB_PATH = path.join(tempDir, "handprint.sqlite");
  resetHandprintDatabaseCache();

  try {
    const templateResponse = await postSocialLedger(
      new Request("http://127.0.0.1:3000/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "save_share_template",
          label: "Route test invite",
          message: "Join me for useful action this week.",
          platformId: "messages"
        })
      })
    );
    assert.equal(templateResponse.status, 200);
    const templatePayload = await templateResponse.json();
    assert.equal(templatePayload.template.label, "Route test invite");

    const reportResponse = await postSocialLedger(
      new Request("http://127.0.0.1:3000/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "report_content",
          contentType: "comment",
          contentId: "route-comment",
          reason: "Tone or safety review"
        })
      })
    );
    const reportPayload = await reportResponse.json();
    assert.equal(reportPayload.report.status, "queued");

    const resolvedResponse = await postSocialLedger(
      new Request("http://127.0.0.1:3000/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "resolve_report",
          reportId: reportPayload.report.id,
          status: "resolved",
          resolutionNote: "Route test resolved."
        })
      })
    );
    const resolvedPayload = await resolvedResponse.json();
    assert.equal(resolvedPayload.report.status, "resolved");

    await postSocialLedger(
      new Request("http://127.0.0.1:3000/api/social", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "update_preferences",
          preferences: {
            quietMode: true,
            messageRequestPolicy: "event_network",
            externalShareReviewRequired: false
          }
        })
      })
    );

    const ledgerResponse = await getSocialLedger(new Request("http://127.0.0.1:3000/api/social"));
    const ledger = await ledgerResponse.json();
    assert.equal(ledger.templates[0].label, "Route test invite");
    assert.equal(ledger.preferences.quietMode, true);
    assert.equal(ledger.preferences.messageRequestPolicy, "event_network");
    assert.equal(ledger.preferences.externalShareReviewRequired, false);
    assert.deepEqual(ledger.notifications, []);
  } finally {
    resetHandprintDatabaseCache();
    delete process.env.HANDPRINT_DB_PATH;
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("share-card API returns SVG and PNG attachment headers", async () => {
  const svg = await getShareCard(new Request("http://127.0.0.1:3000/api/share-card?platform=messages&template=impact&format=svg&message=Hello"));
  assert.equal(svg.status, 200);
  assert.equal(svg.headers.get("content-type"), "image/svg+xml");
  assert.match(svg.headers.get("content-disposition") ?? "", /handprint-messages-impact\.svg/);

  const png = await getShareCard(new Request("http://127.0.0.1:3000/api/share-card?platform=linkedin&template=milestone&format=png&message=Hello"));
  assert.equal(png.status, 200);
  assert.equal(png.headers.get("content-type"), "image/png");
  assert.match(png.headers.get("content-disposition") ?? "", /handprint-linkedin-milestone\.png/);

  const presetSvg = await getShareCard(new Request("http://127.0.0.1:3000/api/share-card?platform=messages&preset=badge-card&template=impact&format=svg&message=Hello"));
  assert.equal(presetSvg.status, 200);
  assert.match(presetSvg.headers.get("content-disposition") ?? "", /handprint-badge-card-impact\.svg/);
  const presetSvgText = await presetSvg.text();
  assert.match(presetSvgText, /width="1024"/);
  assert.match(presetSvgText, /Badge Card/);
  assert.match(presetSvgText, /handprint\.app\/h\/hp-dan/);
});

test("profile API persists settings and QR controls", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "handprint-profile-db-"));
  process.env.HANDPRINT_DB_PATH = path.join(tempDir, "handprint.sqlite");
  resetHandprintDatabaseCache();

  try {
    const postResponse = await postProfile(
      new Request("http://127.0.0.1:3000/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile: { name: "Dan Test", launchCommunity: "Martinsburg, WV", radiusMiles: 100 },
          settings: { qrEnabled: false, messageRequestPolicy: "event_network" }
        })
      })
    );
    assert.equal(postResponse.status, 200);
    const posted = await postResponse.json();
    assert.equal(posted.profile.name, "Dan Test");
    assert.equal(posted.settings.qrEnabled, false);

    const rotateResponse = await patchProfileQr(
      new Request("http://127.0.0.1:3000/api/profile/qr", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "rotate" })
      })
    );
    assert.equal(rotateResponse.status, 200);
    const rotated = await rotateResponse.json();
    assert.equal(rotated.settings.qrEnabled, true);
    assert.match(rotated.settings.qrRotatedAt, /^\d{4}-\d{2}-\d{2}$/);

    const getResponse = await getProfile(new Request("http://127.0.0.1:3000/api/profile"));
    const ledger = await getResponse.json();
    assert.equal(ledger.profile.launchCommunity, "Martinsburg, WV");
    assert.equal(ledger.settings.messageRequestPolicy, "event_network");
  } finally {
    resetHandprintDatabaseCache();
    delete process.env.HANDPRINT_DB_PATH;
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("mobile profile API persists default reach and reward settings", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "handprint-mobile-profile-db-"));
  process.env.HANDPRINT_DB_PATH = path.join(tempDir, "handprint.sqlite");
  resetHandprintDatabaseCache();

  try {
    const postResponse = await postMobileProfile(
      new Request("http://127.0.0.1:3000/api/mobile/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          profile: { launchCommunity: "Martinsburg, WV", radiusMiles: 150, rewardsEnabled: false }
        })
      })
    );
    assert.equal(postResponse.status, 200);
    const posted = await postResponse.json();
    assert.equal(posted.profile.radiusMiles, 150);
    assert.equal(posted.profile.rewardsEnabled, false);

    const getResponse = await getMobileProfile(new Request("http://127.0.0.1:3000/api/mobile/profile"));
    const ledger = await getResponse.json();
    assert.equal(ledger.profile.launchCommunity, "Martinsburg, WV");
    assert.equal(ledger.profile.radiusMiles, 150);
    assert.equal(ledger.qr.fallbackUrl, "/h/hp-dan");
  } finally {
    resetHandprintDatabaseCache();
    delete process.env.HANDPRINT_DB_PATH;
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("mobile World Changer follows persist saved state", async () => {
  const tempDir = mkdtempSync(path.join(tmpdir(), "handprint-world-changer-db-"));
  process.env.HANDPRINT_DB_PATH = path.join(tempDir, "handprint.sqlite");
  resetHandprintDatabaseCache();

  try {
    const initialResponse = await getMobileWorldChangers(new Request("http://127.0.0.1:3000/api/mobile/world-changers"));
    const initial = await initialResponse.json();
    assert.equal(initial.profiles.some((profile: { handle: string }) => profile.handle === "maya-rivera"), true);

    const postResponse = await postMobileWorldChangers(
      new Request("http://127.0.0.1:3000/api/mobile/world-changers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle: "maya-rivera", savedByViewer: false })
      })
    );
    assert.equal(postResponse.status, 200);
    const posted = await postResponse.json();
    assert.equal(posted.profile.savedByViewer, false);

    const getResponse = await getMobileWorldChangers(new Request("http://127.0.0.1:3000/api/mobile/world-changers"));
    const ledger = await getResponse.json();
    const maya = ledger.profiles.find((profile: { handle: string }) => profile.handle === "maya-rivera");
    assert.equal(maya.savedByViewer, false);
  } finally {
    resetHandprintDatabaseCache();
    delete process.env.HANDPRINT_DB_PATH;
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("mobile badge, reward, and training endpoints expose detail payloads", async () => {
  const badgeResponse = await getMobileBadges();
  assert.equal(badgeResponse.status, 200);
  const badgePayload = await badgeResponse.json();
  assert.equal(Array.isArray(badgePayload.badges), true);
  assert.ok(badgePayload.badges.length > 0);

  const badgeDetailResponse = await getMobileBadgeDetail(new Request("http://127.0.0.1:3000/api/mobile/badges/badge-pantry-builder"), {
    params: { badgeId: "badge-pantry-builder" }
  });
  assert.equal(badgeDetailResponse.status, 200);
  const badgeDetail = await badgeDetailResponse.json();
  assert.equal(badgeDetail.badge.title, "Pantry Builder");
  assert.match(badgeDetail.verification.praise, /changed something real/);

  const rewardResponse = await getMobileRewards();
  assert.equal(rewardResponse.status, 200);
  const rewardPayload = await rewardResponse.json();
  assert.equal(typeof rewardPayload.verifiedPoints, "number");
  assert.equal(Array.isArray(rewardPayload.rewards), true);

  const rewardDetailResponse = await getMobileRewardDetail(new Request("http://127.0.0.1:3000/api/mobile/rewards/reward-goody-two-shoes"), {
    params: { rewardId: "reward-goody-two-shoes" }
  });
  assert.equal(rewardDetailResponse.status, 200);
  const rewardDetail = await rewardDetailResponse.json();
  assert.equal(rewardDetail.reward.title, "Goody Two Shoes Award");
  assert.equal(rewardDetail.eligibility.reviewRequired, true);

  const credentialResponse = await getMobileTrainingCredentials();
  assert.equal(credentialResponse.status, 200);
  const credentialPayload = await credentialResponse.json();
  assert.equal(Array.isArray(credentialPayload.credentials), true);
  assert.ok(credentialPayload.credentials.some((credential: { id: string }) => credential.id === "credential-first-aid-cpr"));
});
