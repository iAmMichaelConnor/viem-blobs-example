import cKzg from "c-kzg";
import type { Blob, Bytes32, Bytes48, KZGProof, ProofResult } from "c-kzg";
const {
  BYTES_PER_BLOB,
  loadTrustedSetup,
  blobToKzgCommitment,
  computeKzgProof,
  verifyKzgProof,
  computeBlobKzgProof,
  verifyBlobKzgProofBatch,
} = cKzg;

const blobs = [] as Blob[];
const commitments = [] as Bytes48[];
const kzgProofs = [] as KZGProof[]; // proofs of this form are returned by computeBlobKzgProof
const proofResults = [] as ProofResult[]; // proofs of this form are returned by computeKzgProof

loadTrustedSetup();

test.skip("Test kzg functions", () => {
  const BATCH_SIZE = 3;

  for (let i = 0; i < BATCH_SIZE; i++) {
    blobs.push(Buffer.alloc(BYTES_PER_BLOB));
    (blobs[i] as Buffer).write("potato", 0, "utf8");
    commitments.push(blobToKzgCommitment(blobs[i]));
    kzgProofs.push(computeBlobKzgProof(blobs[i], commitments[i]));
  }
  const isValid = verifyBlobKzgProofBatch(blobs, commitments, kzgProofs);

  expect(isValid).toBe(true);
});

test.skip("Test kzg precise proof", () => {
  const BATCH_SIZE = 1;

  const zBytes = Buffer.alloc(32);

  // blobs[0][31] = x, and z = 0x01 results in y = x.
  // So the first blob field is evaluated at 0x01.
  (zBytes as Buffer).write("01", 31, "hex");
  let one = zBytes;

  // This is the 2nd root of unity, after 1, because we actually get the bit_reversal_permutation of the root of unity. And although `7` is the primitive root of unity, the roots of unity are derived as 7 ^ ((BLS_MODULUS - 1) / FIELD_ELEMENTS_PER_BLOB) mod BLS_MODULUS.
  (zBytes as Buffer).write(
    "73EDA753299D7D483339D80809A1D80553BDA402FFFE5BFEFFFFFFFF00000000",
    0,
    "hex"
  ); // equiv to 52435875175126190479447740508185965837690552500527637822603658699938581184512 which is actually -1 in the scalar field!

  blobs.push(Buffer.alloc(BYTES_PER_BLOB));
  (blobs[0] as Buffer).write("09", 31, "hex");
  (blobs[0] as Buffer).write("07", 31 + 32, "hex");

  proofResults.push(computeKzgProof(blobs[0], zBytes));

  commitments.push(blobToKzgCommitment(blobs[0]));

  const isValid = verifyKzgProof(
    commitments[0],
    zBytes,
    /** y: */ proofResults[0][1],
    /** proof: */ proofResults[0][0]
  );

  expect(isValid).toBe(true);
});
