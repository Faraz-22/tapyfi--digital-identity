import type { Profile } from "../types";
import { getStableProfileUrl } from "./format";

export function buildSignatureHtml(profile: Profile, includeQr: boolean) {
  const profileUrl = getStableProfileUrl(profile);
  const links = profile.links
    .filter((link) => link.enabled)
    .slice(0, 5)
    .map(
      (link) =>
        `<a href="${link.url}" style="color:${profile.accent};text-decoration:none;margin-right:10px">${link.label}</a>`
    )
    .join("");

  const qr = includeQr
    ? `<td style="padding-left:18px"><img alt="Profile QR" width="72" height="72" src="https://api.qrserver.com/v1/create-qr-code/?size=144x144&data=${encodeURIComponent(
        profileUrl
      )}" /></td>`
    : "";

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;color:#101318">
  <tr>
    <td style="padding-right:14px">
      <img src="${profile.avatar}" width="64" height="64" alt="${profile.name}" style="border-radius:18px;object-fit:cover" />
    </td>
    <td>
      <div style="font-size:18px;font-weight:700;color:#050608">${profile.name}</div>
      <div style="font-size:13px;color:#4b5563">${profile.title} · ${profile.company}</div>
      <div style="font-size:13px;color:#4b5563;margin-top:6px">${profile.emails[0]} · ${profile.phones[0]}</div>
      <div style="margin-top:8px">${links}</div>
      <a href="${profileUrl}" style="display:inline-block;margin-top:10px;background:${profile.accent};color:#050608;padding:8px 12px;border-radius:999px;font-size:12px;font-weight:700;text-decoration:none">Open digital identity</a>
    </td>
    ${qr}
  </tr>
</table>`;
}
