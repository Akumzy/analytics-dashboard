type NestedObject = {
  [key: string]: any | NestedObject | NestedObject[] | null;
};

// The redaction function with TypeScript types
function redactFields<T extends NestedObject>(obj: T, fieldsToRedact: string[], redactValue: string = '[REDACTED]'): T {
  // If obj is null or not an object, return it as is
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item: any) => redactFields(item, fieldsToRedact, redactValue)) as unknown as T;
  }

  // Handle objects
  const result: NestedObject = {};
  for (const [key, value] of Object.entries(obj)) {
    // If the key is in fieldsToRedact, redact it
    if (fieldsToRedact.includes(key)) {
      result[key] = redactValue;
    } else {
      // Recursively process nested objects
      result[key] = redactFields(value, fieldsToRedact, redactValue);
    }
  }
  return result as T;
}

// To test with a sample:
const sample = {
  kind: 'single',
  singleResult: {
    data: {
      me: {
        id: 'abe68fd7-a8e9-4f7e-9383-a5a3bff73ace',
        firstName: 'Akuma',
        lastName: 'Isaac',
        username: 'Akuma',
        email: 'akumaisaacakuma@gmail.com',
        phoneNumber: '8036842046',
        intlPhoneNumber: '+2348036842046',
        status: 'ACTIVE',
        isPhoneVerified: true,
        isEmailVerified: true,
        isBVNVerified: true,
        isNINVerified: false,
        isWalletFunded: true,
        countryCode: 'NG',
        connectionHash: null,
        photo: {
          id: '25e09d40-27a8-4842-908d-9464fcab85e7',
          path: 'v1-dev-images/3749ad44-9e24-4e12-b1ba-33dad839574f.jpg',
          width: 536,
          height: 536,
          __typename: 'FileRecord',
        },
        kycStage: 2,
        userTypeId: 'USER',
        pages: [
          {
            id: 'cm6upxyyw0000rycv9i0hu4qk',
            __typename: 'Page',
          },
        ],
        __typename: 'User',
      },
    },
  },
};

const redactedSample = redactFields(sample, [
  'tokenizedText',
  'text',
  'firstName',
  'lastName',
  'username',
  'email',
  'password',
  'phoneNumber',
  'intlPhoneNumber',
]);
console.log(JSON.stringify(redactedSample, null, 2));
