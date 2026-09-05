"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, UserPlus, Sparkles, Building2, User, Award, Check } from "lucide-react";
import { ALL_INDIAN_STATES, getDistrictsForState } from "@/lib/data/india-districts";
import { sound } from "@/lib/sound";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CITIZEN" | "SOLVER" | "INDUSTRY">("SOLVER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [district, setDistrict] = useState("Ranchi");
  const [state, setState] = useState("Jharkhand");
  const [skillsText, setSkillsText] = useState("Remote Sensing, Hydrology, IoT Sensors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const availableDistricts = useMemo(() => getDistrictsForState(state), [state]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setLoading(true);
    setError("");

    const skills = skillsText
      ? skillsText.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          organization,
          designation,
          district,
          state,
          skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      sound.playCelebration();
      if (role === "SOLVER") router.push("/solver/dashboard");
      else if (role === "INDUSTRY") router.push("/industry");
      else router.push("/challenges");

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating account");
      sound.playAlert();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2 font-serif text-gov-navy text-2xl font-bold">
          <ShieldAlert className="w-7 h-7 text-gov-saffron" />
          <span>Join the JanSahaya Network</span>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Connect with government departments, researchers, and CSR sponsors to solve societal challenges.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Role selector buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Your Stakeholder Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("SOLVER")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === "SOLVER"
                    ? "border-gov-navy bg-blue-50 text-gov-navy shadow-sm ring-1 ring-gov-navy"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold">🔬 Researcher / Solver</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Faculty, Student, Innovator</div>
              </button>

              <button
                type="button"
                onClick={() => setRole("CITIZEN")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === "CITIZEN"
                    ? "border-gov-saffron bg-amber-50 text-gov-saffron shadow-sm ring-1 ring-gov-saffron"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold">👤 Citizen Volunteer</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Report Ground Issues</div>
              </button>

              <button
                type="button"
                onClick={() => setRole("INDUSTRY")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === "INDUSTRY"
                    ? "border-purple-600 bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-600"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold">🏭 Industry CSR Partner</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Sponsor & Mentor Pilots</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Aarav Mehta"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.mehta@bitmesra.ac.in"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization / Institute</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Birla Institute of Technology, Mesra"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => {
                  const newState = e.target.value;
                  setState(newState);
                  const dists = getDistrictsForState(newState);
                  setDistrict(dists[0] || "");
                }}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-white"
              >
                {ALL_INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District ({availableDistricts.length} in {state})
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none bg-white"
              >
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d} ({state})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {role === "SOLVER" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Research Expertise / Skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Remote Sensing, Flood Modeling, Drone Survey, Water Filtration"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gov-navy hover:bg-gov-navyLight text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Creating Profile..." : "Register Profile"}</span>
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-gov-navy hover:underline">
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
