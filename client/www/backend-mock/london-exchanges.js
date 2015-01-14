var backend = {
  mock: {
    exchanges: {
      '/exchange': [
          {
            id: 0,
            location: {
              latitude: 51.5060,
              longitude: 0.1260
            },
            details: {
              title: 'London Exchange'
            }
          },
          {
            id: 1,
            location: {
              latitude: 51.5032,
              longitude: 0.1232
            },
            details: {
              title: 'Yorkshare Exchange'
            }
          }
      ],
      '/exchange/0': {
        id: 0,
        details: {
          title: 'London Exchange',
          address: '15 Appold Street, London',
          country: 'United Kingdom',
          openingHours: '8:30am - 5:30pm',
          userRatings: 4
        }
      },
      '/exchange/1': {
        id: 1,
        details: {
          title: 'Yorkshare Exchange',
          address: '36-42 New Inn Yard, London',
          country: 'United Kingdom',
          openingHours: '9:00am - 6:00pm',
          userRatings: 3.5
        }
      }
    }
  }
};
