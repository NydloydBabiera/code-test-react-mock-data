// Temporary mock data for UI testing.
// Set this to true only when you want to test the UI without the live API.
export const USE_MOCK_DATA = true;

const missionNames = [
  'Falcon 1',
  'Falcon 9',
  'Starlink',
  'Crew Dragon',
  'Atlas V',
  'Delta IV',
  'Ariane 5',
  'Inspiration4',
  'GPS III',
  'Transporter'
];

const launchSites = [
  'Cape Canaveral Air Force Station',
  'Vandenberg Air Force Base',
  'Kennedy Space Center',
  'Baikonur Cosmodrome',
  'Guiana Space Centre'
];

export const mockLaunches = Array.from({ length: 35 }, (_, index) => {
  const missionName = missionNames[index % missionNames.length];
  const year = 2015 + (index % 9);
  const date = new Date(Date.UTC(year, (index % 12), (index % 28) + 1, 12, 0, 0));

  return {
    flight_number: index + 1,
    mission_name: `${missionName} ${index + 1}`,
    launch_year: String(year),
    launch_success: index % 4 !== 0,
    details: `Mock mission details for ${missionName}. This entry is used only to validate the loader, search, and infinite scroll behavior.`,
    launch_site: {
      site_name_long: launchSites[index % launchSites.length]
    },
    launch_date_utc: date.toISOString(),
    links: {
      mission_patch_small: `https://images2.imgbox.com/${index % 2 === 0 ? '7a' : '5b'}/dummy-${index + 1}.png`
    }
  };
});

export const mockFetchLaunches = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(mockLaunches), 400);
  });
