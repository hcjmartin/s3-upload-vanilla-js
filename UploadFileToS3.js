const crypto = require('crypto');

// It goes without saying, but please use limited permissions
const accessKeyId = 'ACCESS_KEY'; // Change me
const secretAccessKey = 'SECRET_KEY'; // Change me

// Utility functions
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest();
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

function getPresignedUrl({ region, bucket, key, accessKeyId, secretAccessKey, expiresIn }) {
    const method = 'PUT';
    const service = 's3';
    const host = `${bucket}.s3.${region}.amazonaws.com`;
    const endpoint = `https://${host}/${key}`;
    const algorithm = 'AWS4-HMAC-SHA256';
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);

    // Create canonical request
    const canonicalUri = `/${key}`;
    const canonicalQuerystring = `X-Amz-Algorithm=${algorithm}&X-Amz-Credential=${encodeURIComponent(
        `${accessKeyId}/${dateStamp}/${region}/${service}/aws4_request`
    )}&X-Amz-Date=${amzDate}&X-Amz-Expires=${expiresIn}&X-Amz-SignedHeaders=host`;
    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = 'host';
    const payloadHash = 'UNSIGNED-PAYLOAD';
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    // Create string to sign
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${sha256(canonicalRequest)}`;

    // Calc signature
    const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, service);
    const kSigning = hmac(kService, 'aws4_request');
    const signature = hmac(kSigning, stringToSign).toString('hex');

    // Construct presigned URL
    return `${endpoint}?${canonicalQuerystring}&X-Amz-Signature=${signature}`;
}

// Generate a presigned upload URL
const presignedUrl = getPresignedUrl({
    region: 'REGION', // Change me (aws bucket region)
    bucket: 'BUCKET_NAME', // Change me (aws bucket name)
    key: 'FILE_KEY.json', // Change me (file name / key)
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    expiresIn: 3600, // 1 hour
});

// We can now use this PUT presignedUrl to do a simple file upload using fetch!
console.log('Presigned upload URL:', presignedUrl);

// Here's a basic JSON file upload example
const jsonContent = { name: "value" }

const jsonContentStringified = JSON.stringify(jsonContent, null, 2);

const contentType = "application/json";

const file = new Blob([jsonContentStringified], { type: contentType });

const uploadResponse = await fetch(presignedUrl, {
  method: "PUT",
  body: file,
  headers: {
    "Content-Type": contentType, // Explicitly set the Content-Type
  },
});

if (uploadResponse.ok) {
  console.log("Upload success", uploadResponse.url);
} else {
  console.error("S3 Upload Error", uploadResponse);
}