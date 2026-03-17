import { createElement } from 'react';
import type { IconType } from 'react-icons';
import * as Fa6Icons from 'react-icons/fa6';
import * as FiIcons from 'react-icons/fi';
import * as Io5Icons from 'react-icons/io5';
import * as MdIcons from 'react-icons/md';
import * as PiIcons from 'react-icons/pi';

type IconModule = Record<string, IconType>;

interface IconModuleConfig {
  label: string;
  value: string;
  prefix: string;
  icons: IconModule;
}

export interface LibraryIconOption {
  value: string;
  label: string;
  pack: string;
  packLabel: string;
  searchText: string;
}

const ICON_MODULES: IconModuleConfig[] = [
  { label: 'Feather', value: 'feather', prefix: 'Fi', icons: FiIcons as IconModule },
  { label: 'FA6', value: 'font-awesome-6', prefix: 'Fa', icons: Fa6Icons as IconModule },
  { label: 'Material', value: 'material', prefix: 'Md', icons: MdIcons as IconModule },
  { label: 'Ion', value: 'ionicons', prefix: 'Io', icons: Io5Icons as IconModule },
  { label: 'Phosphor', value: 'phosphor', prefix: 'Pi', icons: PiIcons as IconModule },
];

const TRAVEL_ICON_NAMES = [
  'FiMap',
  'FiMapPin',
  'FiCompass',
  'FiGlobe',
  'FiCoffee',
  'FiCamera',
  'FiSun',
  'FiMoon',
  'FiHome',
  'FiTruck',
  'FiUsers',
  'FiShield',
  'FiHeart',
  'FiWifi',
  'FaPlaneDeparture',
  'FaHotel',
  'FaBed',
  'FaPassport',
  'FaRoute',
  'FaMountainSun',
  'FaUmbrellaBeach',
  'MdOutlineRestaurant',
  'MdOutlineDirectionsBus',
  'MdOutlineLocalTaxi',
  'MdOutlineMuseum',
  'MdOutlineHiking',
  'IoBoatOutline',
  'IoTrainOutline',
  'IoBicycleOutline',
  'PiTent',
  'PiAirplaneTilt',
  'PiMountains',
  'PiSuitcaseRolling',
];

const normalizeLabel = (name: string, prefix: string) =>
  name
    .replace(new RegExp(`^${prefix}`), '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim();

const iconEntries = ICON_MODULES.flatMap((module) =>
  Object.entries(module.icons)
    .filter(([name, component]) => {
      if (!name.startsWith(module.prefix) || typeof component !== 'function') return false;
      const label = normalizeLabel(name, module.prefix);
      return label.length > 0;
    })
    .map(([name]) => ({
      value: name,
      label: normalizeLabel(name, module.prefix),
      pack: module.value,
      packLabel: module.label,
      searchText: `${name} ${normalizeLabel(name, module.prefix)} ${module.label}`.toLowerCase(),
    }))
);

export const LIBRARY_ICON_PACKS = ICON_MODULES.map(({ label, value }) => ({ label, value }));

export const LIBRARY_ICON_OPTIONS: LibraryIconOption[] = iconEntries.sort((a, b) =>
  a.label.localeCompare(b.label)
);

const iconOptionMap = new Map(LIBRARY_ICON_OPTIONS.map((option) => [option.value, option]));

const iconComponentMap = new Map(
  ICON_MODULES.flatMap((module) =>
    Object.entries(module.icons)
      .filter(([name, component]) => name.startsWith(module.prefix) && typeof component === 'function')
      .map(([name, component]) => [name, component] as const)
  )
);

const LEGACY_ICON_ALIASES: Record<string, string> = {
  'user-check': 'FaUserCheck',
  hotel: 'FaHotel',
  utensils: 'FaUtensils',
  car: 'FaCar',
  ticket: 'FaTicket',
  'shield-check': 'FaShieldHalved',
  'plane-arrival': 'FaPlaneArrival',
};

function resolveLibraryIconValue(value?: string | null): string | null {
  if (!value) return null;
  return LEGACY_ICON_ALIASES[value] ?? value;
}

export const SUGGESTED_LIBRARY_ICON_OPTIONS = TRAVEL_ICON_NAMES.map((value) => iconOptionMap.get(value)).filter(
  (option): option is LibraryIconOption => Boolean(option)
);

export function findLibraryIconComponent(value?: string | null): IconType | null {
  const resolvedValue = resolveLibraryIconValue(value);
  if (!resolvedValue) return null;
  return iconComponentMap.get(resolvedValue) ?? null;
}

export function getLibraryIconOption(value?: string | null): LibraryIconOption | null {
  const resolvedValue = resolveLibraryIconValue(value);
  if (!resolvedValue) return null;
  return iconOptionMap.get(resolvedValue) ?? null;
}

interface LibraryIconProps {
  value?: string | null;
  className?: string;
  size?: number;
  fallbackClassName?: string;
}

export function LibraryIcon({ value, className, size = 16, fallbackClassName }: LibraryIconProps) {
  if (!value) return null;

  const IconComponent = findLibraryIconComponent(value);

  if (IconComponent) {
    return createElement(IconComponent, { className, size, 'aria-hidden': 'true' });
  }

  return (
    <span className={fallbackClassName ?? className} aria-hidden="true">
      {value}
    </span>
  );
}