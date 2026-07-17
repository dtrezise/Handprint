"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Camera, CircleUserRound, MapPinned, ShieldCheck, Sparkles, Trophy, Upload } from "lucide-react";
import { defaultProfile, initialMarks, publicHandprintProfile, worldChangerProgress, type UserProfile } from "@/lib/handprint-data";

const storageKey = "handprint:first-draft-state:v8";
const profileSettingsKey = "handprint:profile-settings:v1";
const defaultProfileState: UserProfile = { ...defaultProfile, rewardsEnabled: true, interests: [], skills: [] };
const knownCities = ["Martinsburg, WV", "Hagerstown, MD", "Winchester, VA", "Frederick, MD", "Washington, DC", "Baltimore, MD"];
const availabilityOptions = ["Weeknight", "Saturday morning", "Saturday afternoon", "Sunday afternoon", "Flexible", "Remote"];
const avatarSkins = [
  { id: "generic", label: "Classic helper", status: "Available", accent: "#4f8a62" },
  { id: "badge-builder", label: "Builder skin", status: "Earned at Builder", accent: "#c99a35" },
  { id: "anchor", label: "Anchor skin", status: "Locked", accent: "#7a89d8" },
  { id: "world-changer", label: "World Changer skin", status: "Locked", accent: "#d982b5" }
];

type SavedProfileState = {
  profile?: UserProfile;
  profilePanelItems?: {
    interests: string[];
    skills: string[];
  };
  actions?: unknown[];
  selectedId?: string;
  rsvps?: Record<string, string>;
  marks?: unknown[];
};

type ProfileSettings = {
  avatarUrl?: string;
  avatarSkinId: string;
  notifyComments?: boolean;
  notifyMessages?: boolean;
  notifyReviews?: boolean;
  quietSocialMode?: boolean;
  publicProfileVisible?: boolean;
  badgesVisible?: boolean;
  qrEnabled?: boolean;
  qrRotatedAt?: string;
  messageRequestPolicy?: "everyone" | "followed_network" | "event_network";
};

const defaultProfileSettings: ProfileSettings = {
  avatarSkinId: "generic",
  notifyComments: true,
  notifyMessages: true,
  notifyReviews: true,
  quietSocialMode: false,
  publicProfileVisible: true,
  badgesVisible: true,
  qrEnabled: true,
  qrRotatedAt: "2026-07-09",
  messageRequestPolicy: "followed_network"
};

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfileState);
  const [savedState, setSavedState] = useState<SavedProfileState>({});
  const [settings, setSettings] = useState<ProfileSettings>(defaultProfileSettings);
  const [saved, setSaved] = useState(false);
  const progress = worldChangerProgress(initialMarks);
  const activeSkin = avatarSkins.find((skin) => skin.id === settings.avatarSkinId) ?? avatarSkins[0];

  useEffect(() => {
    const rawState = window.localStorage.getItem(storageKey);
    const parsedState = rawState ? (JSON.parse(rawState) as SavedProfileState) : {};
    setSavedState(parsedState);
    setProfile({ ...defaultProfileState, ...(parsedState.profile ?? {}), rewardsEnabled: parsedState.profile?.rewardsEnabled ?? true });

    const rawSettings = window.localStorage.getItem(profileSettingsKey);
    if (rawSettings) setSettings({ ...defaultProfileSettings, ...(JSON.parse(rawSettings) as ProfileSettings) });

    fetch("/api/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((ledger: { profile?: UserProfile; settings?: ProfileSettings } | null) => {
        if (!ledger) return;
        if (ledger.profile) setProfile({ ...defaultProfileState, ...ledger.profile });
        if (ledger.settings) setSettings({ ...defaultProfileSettings, ...ledger.settings });
      })
      .catch(() => {
        // Local storage remains the offline fallback for the first draft profile screen.
      });
  }, []);

  const saveProfile = (nextProfile: UserProfile, nextSettings = settings) => {
    setProfile(nextProfile);
    setSettings(nextSettings);
    window.localStorage.setItem(storageKey, JSON.stringify({ ...savedState, profile: nextProfile }));
    window.localStorage.setItem(profileSettingsKey, JSON.stringify(nextSettings));
    void fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: nextProfile, settings: nextSettings })
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const updateProfile = (patch: Partial<UserProfile>) => {
    saveProfile({ ...profile, ...patch });
  };

  const toggleAvailability = (value: string) => {
    const availability = profile.availability.includes(value)
      ? profile.availability.filter((item) => item !== value)
      : [...profile.availability, value];
    updateProfile({ availability });
  };

  const updatePhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => saveProfile(profile, { ...settings, avatarUrl: String(reader.result), avatarSkinId: "custom-photo" });
    reader.readAsDataURL(file);
  };

  const chooseSkin = (avatarSkinId: string) => {
    const skin = avatarSkins.find((item) => item.id === avatarSkinId);
    if (!skin || skin.status === "Locked") return;
    saveProfile(profile, { ...settings, avatarSkinId, avatarUrl: avatarSkinId === "custom-photo" ? settings.avatarUrl : settings.avatarUrl });
  };

  const updateQr = async (action: "rotate" | "enable" | "disable") => {
    const response = await fetch("/api/profile/qr", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    if (!response.ok) return;
    const ledger = (await response.json()) as { settings?: ProfileSettings };
    if (ledger.settings) {
      const nextSettings = { ...defaultProfileSettings, ...ledger.settings };
      setSettings(nextSettings);
      window.localStorage.setItem(profileSettingsKey, JSON.stringify(nextSettings));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    }
  };

  return (
    <main className="handprint-dark min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm font-semibold text-paper/78 transition hover:border-tide hover:text-white">
          <ArrowLeft size={17} />
          Back to Reach
        </Link>

        <section className="mt-5 rounded-lg border border-white/10 bg-white/90 p-5 shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tide">Profile settings</p>
              <h1 className="mt-1 text-4xl font-semibold">Your Handprint identity</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/68">
                This controls your public identity, default search location, availability, and avatar. Avatar skins will eventually unlock through badges and rank progression.
              </p>
            </div>
            <div className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gold/35 bg-gold/10 px-4 font-semibold text-paper">
              <Trophy size={18} className="text-gold" />
              {progress.currentTier.name}
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <section className="rounded-lg border border-white/10 bg-paper p-5">
            <div className="mx-auto grid h-40 w-40 place-items-center overflow-hidden rounded-full border-4 border-gold/50 bg-white/10" style={{ boxShadow: `0 0 0 8px ${activeSkin.accent}22` }}>
              {settings.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.avatarUrl} alt="Profile avatar preview" className="h-full w-full object-cover" />
              ) : (
                <CircleUserRound size={82} className="text-paper/72" />
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-2xl font-semibold">{profile.name}</p>
              <p className="mt-1 text-sm font-semibold text-paper/55">@{publicHandprintProfile.handle}</p>
            </div>
            <label className="mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:brightness-110">
              <Upload size={17} />
              Upload photo
              <input type="file" accept="image/*" onChange={(event) => updatePhoto(event.target.files?.[0])} className="hidden" />
            </label>
            <div className="mt-4 rounded-md border border-white/10 bg-white/5 p-3 text-sm leading-6 text-paper/62">
              <div className="flex items-center gap-2 font-semibold text-paper">
                <Camera size={16} className="text-tide" />
                Avatar skins
              </div>
              <p className="mt-1">Rank skins will let your avatar show your latest World Changer status.</p>
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/90 p-5 shadow-soft">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">
                Display name
                <input
                  value={profile.name}
                  onChange={(event) => updateProfile({ name: event.target.value })}
                  className="min-h-11 rounded-md border border-tide/60 bg-paper px-3 font-normal outline-none focus:border-tide"
                />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Default location
                <input
                  list="profile-known-cities"
                  value={profile.launchCommunity}
                  onChange={(event) => updateProfile({ launchCommunity: event.target.value })}
                  className="min-h-11 rounded-md border border-tide/60 bg-paper px-3 font-normal outline-none focus:border-tide"
                />
                <datalist id="profile-known-cities">
                  {knownCities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Default distance
                <select
                  value={profile.radiusMiles}
                  onChange={(event) => updateProfile({ radiusMiles: Number(event.target.value) })}
                  className="min-h-11 rounded-md border border-tide/60 bg-paper px-3 font-normal outline-none focus:border-tide"
                >
                  {[10, 25, 50, 100, 150].map((miles) => (
                    <option key={miles} value={miles}>
                      Within {miles} mi
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-md border border-white/10 bg-paper p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Default search</p>
                <p className="mt-1 text-sm font-semibold">
                  {profile.launchCommunity} · {profile.radiusMiles} miles
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-paper p-3 md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Rewards preference</p>
                    <p className="mt-1 text-sm font-semibold">Earned rewards {profile.rewardsEnabled ? "active" : "paused"}</p>
                    <p className="mt-1 text-xs leading-5 text-ink/58">
                      Keep this active to show reward eligibility and World Changer progression in your experience. Turn it off if you want a quieter service-first view.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateProfile({ rewardsEnabled: !profile.rewardsEnabled })}
                    className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-md px-4 text-sm font-semibold transition ${
                      profile.rewardsEnabled ? "bg-moss text-white" : "border border-white/10 bg-white/10 text-paper/72"
                    }`}
                  >
                    {profile.rewardsEnabled ? "On" : "Off"}
                  </button>
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-paper p-3 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Social safety settings</p>
                <p className="mt-1 text-sm leading-6 text-ink/62">
                  These defaults control how much social activity asks for your attention while keeping comments and messages inside the Affirmation Agent.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    ["notifyComments", "Comments"],
                    ["notifyMessages", "Messages"],
                    ["notifyReviews", "Review decisions"],
                    ["quietSocialMode", "Quiet mode"]
                  ].map(([key, label]) => {
                    const enabled = Boolean(settings[key as keyof ProfileSettings]);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => saveProfile(profile, { ...settings, [key]: !enabled })}
                        className={`min-h-9 rounded-md px-3 text-xs font-semibold ${
                          enabled ? "bg-moss text-white" : "border border-white/10 bg-white/10 text-paper/62"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-paper p-3 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Public Handprint controls</p>
                <p className="mt-1 text-sm leading-6 text-ink/62">
                  Achievements stay visible by default because Handprint is meant to affirm useful action, but identity controls should still be easy to find.
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
                  {[
                    ["publicProfileVisible", "Public profile"],
                    ["badgesVisible", "Badge wall"],
                    ["qrEnabled", "QR card"]
                  ].map(([key, label]) => {
                    const enabled = Boolean(settings[key as keyof ProfileSettings]);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => saveProfile(profile, { ...settings, [key]: !enabled })}
                        className={`min-h-10 rounded-md px-3 text-sm font-semibold ${
                          enabled ? "bg-moss text-white" : "border border-white/10 bg-white/10 text-paper/62"
                        }`}
                      >
                        {label} {enabled ? "visible" : "hidden"}
                      </button>
                    );
                  })}
                </div>
                <label className="mt-3 grid gap-1 text-sm font-semibold">
                  Message requests
                  <select
                    value={settings.messageRequestPolicy}
                    onChange={(event) =>
                      saveProfile(profile, {
                        ...settings,
                        messageRequestPolicy: event.target.value as ProfileSettings["messageRequestPolicy"]
                      })
                    }
                    className="min-h-11 rounded-md border border-tide/60 bg-paper px-3 font-normal outline-none focus:border-tide"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="followed_network">Followed network first</option>
                    <option value="event_network">Event network only</option>
                  </select>
                </label>
                <div className="mt-3 rounded-md border border-tide/20 bg-tide/10 p-3">
                  <p className="text-sm font-semibold">QR rotation controls</p>
                  <p className="mt-1 text-xs leading-5 text-ink/58">
                    V1 keeps one reliable QR per user. Rotation updates the QR state while the public Handprint page remains the destination.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-ink/55">
                    QR {settings.qrEnabled ? "enabled" : "disabled"} · rotated {settings.qrRotatedAt}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => void updateQr("rotate")}
                      className="min-h-10 rounded-md bg-ink px-3 text-sm font-semibold text-paper"
                    >
                      Rotate QR
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateQr("enable")}
                      className="min-h-10 rounded-md bg-moss px-3 text-sm font-semibold text-white"
                    >
                      Enable
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateQr("disable")}
                      className="min-h-10 rounded-md border border-coral/30 bg-coral/10 px-3 text-sm font-semibold text-coral"
                    >
                      Disable
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Availability</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {availabilityOptions.map((option) => {
                  const active = profile.availability.includes(option);
                  return (
                    <button type="button"
                      key={option}
                      onClick={() => toggleAvailability(option)}
                      className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition ${
                        active ? "border-moss bg-moss text-white" : "border-white/10 bg-white/10 text-paper/58 hover:bg-white/15"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">Avatar reward skins</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {avatarSkins.map((skin) => {
                  const active = settings.avatarSkinId === skin.id;
                  const locked = skin.status === "Locked";
                  return (
                    <button type="button"
                      key={skin.id}
                      disabled={locked}
                      onClick={() => chooseSkin(skin.id)}
                      className={`rounded-md border p-3 text-left transition ${
                        locked
                          ? "cursor-not-allowed border-white/10 bg-white/5 text-paper/30"
                          : active
                            ? "border-gold bg-gold/10 text-paper"
                            : "border-white/10 bg-paper text-paper/70 hover:border-tide"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2 text-sm font-semibold">
                        <Sparkles size={15} style={{ color: skin.accent }} />
                        {skin.label}
                      </span>
                      <span className="mt-1 block text-xs">{skin.status}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {saved && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-moss/35 bg-moss/10 px-3 py-2 text-sm font-semibold text-paper">
                <ShieldCheck size={16} className="text-moss" />
                Profile settings saved
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
