// All site copy lives here. Download buttons get their link from DOWNLOAD_API at runtime;
// DOWNLOAD_URL is the fallback if the API is unreachable or no ISO is available yet.
export const DOWNLOAD_URL = 'https://github.com/arc360alt';
export const DOWNLOAD_API = 'https://vertexdl.arc360hub.com/latest';
export const TRY_URL = 'https://arc360alt.github.io/LiquidDesktop/renderer/index.html';
export const LIQUID_REPO = 'https://github.com/arc360alt/LiquidDesktop';

export const drop = `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd1ff"/><stop offset="1" stop-color="#0a5fd8"/></linearGradient></defs><path d="M12 2s7 7.6 7 12.5A7 7 0 0 1 5 14.5C5 9.6 12 2 12 2z" fill="url(#dg)"/><path d="M9 14.5a3 3 0 0 0 3 3" stroke="#fff" stroke-opacity=".8" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

export interface Feature { title: string; body: string }
export interface FeatureGroup { id: string; name: string; color: string; glyph: string; blurb: string; items: Feature[] }

export const featureGroups: FeatureGroup[] = [
  {
    id: 'lumen', name: 'Lumen', color: '#0a84ff', glyph: '💧',
    blurb: 'Arch Linux with LiquidDesktop already set up. Boot it and start using it.',
    items: [
      { title: 'Pure Arch underneath', body: 'Built from archiso’s releng profile, so every package and tool on the official Arch ISO is included, rolling updates too.' },
      { title: 'Flatpak + Flathub, ready to go', body: 'Flathub is set up as a system-wide remote, and LiquidDesktop’s App Store uses it directly.' },
      { title: 'Its own login screen', body: 'greetd runs LiquidDesktop’s greeter inside cage, so the glass carries all the way from boot to the desktop.' },
      { title: 'Batteries included', body: 'NetworkManager, PipeWire/WirePlumber, Bluetooth, Noto fonts with emoji and CJK, Mesa/Vulkan drivers, GParted and zram swap.' },
    ],
  },
  {
    id: 'installer', name: 'Installer', color: '#30d158', glyph: '⬇',
    blurb: 'Install Lumen is built from the same components as System Settings.',
    items: [
      { title: 'Seven simple steps', body: 'Welcome, Location (pick a time zone on a map), Keyboard, Storage, Account, Review and Install.' },
      { title: 'Erase or use existing partitions', body: 'GPT with ext4, Btrfs (with @ @home @log @pkg subvolumes) or XFS. You can also choose existing partitions for /, EFI and /home, and os-prober finds your other systems.' },
      { title: 'Optional LUKS2 encryption', body: 'Full-disk encryption is a single toggle.' },
      { title: 'Works offline', body: 'It copies the live system’s squashfs straight to disk, so no internet is needed. Passwords go over stdin and never appear on a command line or in a file.' },
    ],
  },
  {
    id: 'shell', name: 'Shell', color: '#bf5af2', glyph: '◐',
    blurb: 'A translucent menu bar, a glass Dock, Control Center and Spotlight.',
    items: [
      { title: 'Menu bar that reads the wallpaper', body: 'Its text color follows the wallpaper. It has app menus, battery, network and a clock.' },
      { title: 'A real Dock', body: 'Magnification, launch bounce, running dots, drag to reorder, and a Trash you can drop files on.' },
      { title: 'Control Center', body: 'Wi-Fi, Bluetooth, Focus, Now Playing, and brightness and volume sliders that control the real hardware.' },
      { title: 'Spotlight & Launchpad', body: 'Search apps, files and actions, use the built-in calculator, and browse every installed .desktop app.' },
      { title: 'Widgets', body: 'Clock, calendar, weather, system stats, quick note and up next. Drag them anywhere on the desktop.' },
    ],
  },
  {
    id: 'wm', name: 'Windows', color: '#ff9f0a', glyph: '▢',
    blurb: 'A window manager made for moving fast.',
    items: [
      { title: 'Tiling built in', body: 'Drag a window to an edge to tile it into halves or quarters, hover the green button for the tile menu, or press Alt+Shift+Arrows.' },
      { title: 'Spaces & Mission Control', body: 'Multiple desktops. Drag a window onto another desktop from Mission Control.' },
      { title: 'All the details', body: 'Resize from all 8 edges, minimize into the Dock, full screen, Show Desktop, Alt+Tab and hot corners.' },
    ],
  },
  {
    id: 'glass', name: 'Liquid Glass', color: '#64d2ff', glyph: '◇',
    blurb: 'Glass that actually bends what’s behind it.',
    items: [
      { title: 'Per-surface lenses', body: 'Each glass surface gets its own SVG displacement lens, generated for its exact size, so the backdrop bends at the edges like real glass.' },
      { title: 'Make it yours', body: 'Clear or tinted glass, refraction on or off, Reduce Transparency, accent colors, and four icon styles: Default, Dark, Clear and Tinted.' },
    ],
  },
  {
    id: 'apps', name: 'Apps', color: '#ff375f', glyph: '✦',
    blurb: 'A full set of apps that match the desktop.',
    items: [
      { title: 'Browser', body: 'Tabs, favorites, history, an encrypted password manager, downloads, and Chrome extensions straight from the Web Store.' },
      { title: 'App Store', body: 'Flathub and Arch packages in one store, with one-click Get / Open / Uninstall and an Updates page.' },
      { title: 'Terminal', body: 'A real PTY with xterm.js. You choose the shell, font, cursor and scrollback.' },
      { title: 'And the rest', body: 'Files, Notes, Text Editor, Calculator, Preview, Calendar, Weather, Activity Monitor, Displays and System Settings.' },
    ],
  },
];

export const shots = [
  { src: 'desktop', caption: 'The desktop: widgets, glass Dock and a menu bar that follows the wallpaper' },
  { src: 'apps', caption: 'App Store: Flathub and Arch packages together' },
  { src: 'settings', caption: 'System Settings: Appearance, accent colors and glass options' },
  { src: 'controlcenter', caption: 'Control Center' },
  { src: 'launchpad', caption: 'Launchpad with every installed app' },
  { src: 'spotlight', caption: 'Spotlight' },
  { src: 'mission', caption: 'Mission Control and Spaces' },
];

export const terminalScript: [string, string][] = [
  ['$ ', 'sudo pacman -S --needed archiso base-devel git nodejs npm'],
  ['', '…'],
  ['$ ', './build.sh'],
  ['', '==> Cloning LiquidDesktop · building packages · mkarchiso'],
  ['', '==> out/lumen-2026.11.12-x86_64.iso  ✓'],
  ['$ ', './run-vm.sh            # try it in QEMU first'],
  ['', ''],
  ['# ', 'Already on another distro? Just grab the desktop:'],
  ['$ ', 'curl -fsSL https://raw.githubusercontent.com/arc360alt/LiquidDesktop/main/install.sh | sh'],
];
