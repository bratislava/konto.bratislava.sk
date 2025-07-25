/**
 * Anonymized response from endpoint `/api/iam/identities/search`
 */
export const mockUpvsIdentityByUriResponse = [
  {
    "ids": [
      {
        "type": "sector_upvs",
        "value": "33333333-1111-1111-1111-444444444444"
      }
    ],
    "uri": "rc://sk/1234567890_anonymized_user1",
    "en": "E0000000001",
    "type": "natural_person",
    "status": "activated",
    "name": "Anonymized User1",
    "suffix": null,
    "various_ids": [],
    "upvs": {
      "edesk_number": "E0000000001",
      "edesk_status": "active",
      "edesk_remote_uri": null,
      "edesk_cuet_delivery_enabled": false,
      "edesk_delivery_limited": false,
      "enotify_preferred_channel": null,
      "enotify_preferred_calendar": null,
      "enotify_emergency_allowed": null,
      "enotify_email_allowed": null,
      "enotify_sms_allowed": null,
      "preferred_language": "sk",
      "re_iam_identity_id": "100001"
    },
    "natural_person": {
      "type": {
        "id": "1",
        "name": "Občan SR s trvalým pobytom na území SR",
        "description": null
      },
      "name": "Anonymized User1",
      "given_names": [
        "Anonymized"
      ],
      "preferred_given_name": null,
      "given_family_names": [
        {
          "primary": null,
          "prefix": null,
          "value": "AnonymizedFamily1"
        }
      ],
      "family_names": [
        {
          "primary": null,
          "prefix": null,
          "value": "AnonymizedFamily2"
        }
      ],
      "legal_name": null,
      "other_name": null,
      "prefixes": [],
      "suffixes": [],
      "alternative_names": [],
      "gender": {
        "id": "2",
        "name": "žena",
        "description": null
      },
      "marital_status": "nezistené",
      "vital_status": null,
      "nationality": null,
      "occupation": null,
      "birth": {
        "date": "1980-01-01",
        "country": {
          "id": "703",
          // eslint-disable-next-line sonarjs/no-duplicate-string
          "name": "Slovenská republika",
          "description": null
        },
        "district": {
          "id": "SK0101",
          "name": "Okres Bratislava I",
          "description": null
        },
        "municipality": {
          "id": "SK0101528595",
          "name": "Bratislava - mestská časť Staré Mesto",
          "description": null
        },
        "part": null
      },
      "death": null,
      "updated_on": null
    },
    "addresses": [
      {
        "type": "resident",
        "inline": null,
        "country": {
          "id": "703",
          "name": "Slovenská republika",
          "description": null
        },
        "region": null,
        "district": {
          "id": "SK0102",
          "name": "Okres Bratislava II",
          "description": null
        },
        "municipality": {
          "id": "SK0102529311",
          "name": "Bratislava - mestská časť Podunajské Biskupice",
          "description": null
        },
        "part": null,
        "street": "Anonymized Street",
        "building_number": "1A",
        "registration_number": 10000,
        "unit": null,
        "building_index": null,
        "delivery_address": {
          "postal_code": "10000",
          "post_office_box": null,
          "recipient": null
        },
        "ra_entry": "1000000000",
        "specified": true
      }
    ],
    "emails": [],
    "phones": []
  },
  {
    "ids": [
      {
        "type": "sector_upvs",
        "value": "33333333-1111-1111-1111-555555555555"
      }
    ],
    "uri": "rc://sk/2345678901_anonymized_user2",
    "en": "E0000000002",
    "type": "natural_person",
    "status": "activated",
    "name": "Anonymized User2",
    "suffix": null,
    "various_ids": [],
    "upvs": {
      "edesk_number": "E0000000002",
      "edesk_status": "created",
      "edesk_remote_uri": null,
      "edesk_cuet_delivery_enabled": false,
      "edesk_delivery_limited": false,
      "enotify_preferred_channel": null,
      "enotify_preferred_calendar": null,
      "enotify_emergency_allowed": null,
      "enotify_email_allowed": null,
      "enotify_sms_allowed": null,
      "preferred_language": "sk",
      "re_iam_identity_id": "100002"
    },
    "natural_person": {
      "type": {
        "id": "1",
        "name": "Občan SR s trvalým pobytom na území SR",
        "description": null
      },
      "name": "Anonymized User2",
      "given_names": [
        "Anonymized"
      ],
      "preferred_given_name": null,
      "given_family_names": [
        {
          "primary": null,
          "prefix": null,
          "value": "AnonymizedFamily3"
        }
      ],
      "family_names": [
        {
          "primary": null,
          "prefix": null,
          "value": "AnonymizedFamily3"
        }
      ],
      "legal_name": null,
      "other_name": null,
      "prefixes": [],
      "suffixes": [],
      "alternative_names": [],
      "gender": {
        "id": "2",
        "name": "žena",
        "description": null
      },
      "marital_status": "nezistené",
      "vital_status": null,
      "nationality": null,
      "occupation": null,
      "birth": {
        "date": "1980-01-01",
        "country": {
          "id": "703",
          "name": "Slovenská republika",
          "description": null
        },
        "district": null,
        "municipality": {
          "id": "0",
          "name": "Bratislava",
          "description": null
        },
        "part": null
      },
      "death": null,
      "updated_on": null
    },
    "addresses": [
      {
        "type": "resident",
        "inline": null,
        "country": {
          "id": "703",
          "name": "Slovenská republika",
          "description": null
        },
        "region": null,
        "district": {
          "id": "SK032D",
          "name": "Okres Žiar nad Hronom",
          "description": null
        },
        "municipality": {
          "id": "SK032D516970",
          "name": "Kremnica",
          "description": null
        },
        "part": null,
        "street": "Anonymized Street",
        "building_number": "2B",
        "registration_number": 20000,
        "unit": null,
        "building_index": null,
        "delivery_address": {
          "postal_code": "20000",
          "post_office_box": null,
          "recipient": null
        },
        "ra_entry": "2000000000",
        "specified": true
      }
    ],
    "emails": [],
    "phones": []
  },
  {
    "ids": [
      {
        "type": "sector_upvs",
        "value": "33333333-1111-1111-1111-222222222222"
      }
    ],
    "uri": "rc://sk/3456789012_anonymized_user3",
    "en": "E0000000003",
    "type": "natural_person",
    "status": "activated",
    "name": "Anonymized User3",
    "suffix": null,
    "various_ids": [],
    "upvs": {
      "edesk_number": "E0000000003",
      "edesk_status": "created",
      "edesk_remote_uri": null,
      "edesk_cuet_delivery_enabled": false,
      "edesk_delivery_limited": false,
      "enotify_preferred_channel": null,
      "enotify_preferred_calendar": null,
      "enotify_emergency_allowed": null,
      "enotify_email_allowed": null,
      "enotify_sms_allowed": null,
      "preferred_language": "sk",
      "re_iam_identity_id": "100003"
    },
    "natural_person": {
      "type": {
        "id": "1",
        "name": "Občan SR s trvalým pobytom na území SR",
        "description": null
      },
      "name": "Anonymized User3",
      "given_names": [
        "Anonymized"
      ],
      "preferred_given_name": null,
      "given_family_names": [
        {
          "primary": null,
          "prefix": null,
          "value": "AnonymizedFamily4"
        }
      ],
      "family_names": [
        {
          "primary": null,
          "prefix": null,
          "value": "AnonymizedFamily4"
        }
      ],
      "legal_name": null,
      "other_name": null,
      "prefixes": [],
      "suffixes": [],
      "alternative_names": [],
      "gender": {
        "id": "2",
        "name": "žena",
        "description": null
      },
      "marital_status": "nezistené",
      "vital_status": null,
      "nationality": null,
      "occupation": null,
      "birth": {
        "date": "1990-01-01",
        "country": {
          "id": "703",
          "name": "Slovenská republika",
          "description": null
        },
        "district": {
          "id": "SK0103",
          "name": "Okres Bratislava III",
          "description": null
        },
        "municipality": {
          "id": "SK0103529346",
          "name": "Bratislava - mestská časť Nové Mesto",
          "description": null
        },
        "part": null
      },
      "death": null,
      "updated_on": null
    },
    "addresses": [
      {
        "type": "resident",
        "inline": null,
        "country": {
          "id": "703",
          "name": "Slovenská republika",
          "description": null
        },
        "region": null,
        "district": {
          "id": "SK0102",
          "name": "Okres Bratislava II",
          "description": null
        },
        "municipality": {
          "id": "SK0102529320",
          "name": "Bratislava - mestská časť Ružinov",
          "description": null
        },
        "part": null,
        "street": "Anonymized Street",
        "building_number": "3C",
        "registration_number": 30000,
        "unit": null,
        "building_index": null,
        "delivery_address": {
          "postal_code": "30000",
          "post_office_box": null,
          "recipient": null
        },
        "ra_entry": "3000000000",
        "specified": true
      }
    ],
    "emails": [],
    "phones": []
  }
]
