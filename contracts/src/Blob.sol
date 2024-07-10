// SPDX-License-Identifier: APACHE-2.0
pragma solidity >=0.8.26;

contract Blob {
    uint256 txId;
    mapping(uint256 txId => mapping(uint256 blobIndex => bytes32 blobHash)) blobHashes;
    uint256 internal constant BLS_MODULUS =
        52435875175126190479447740508185965837690552500527637822603658699938581184513;
    uint256 internal constant FIELD_ELEMENTS_PER_BLOB = 4096;

    event Hello(uint256 _b);
    event BlobHash(uint256 _txId, bytes32 _blobhash);
    event PointEvaluationSuccess(bool _success);

    function hello(uint256 a) external {
        emit Hello(2 * a);
    }

    function helloAgain() external {
        emit Hello(2 * txId);
    }

    /**
     * You don't actually need to call a function to submit a blob; the tx payload
     * can be empty. I'm calling this function so that the blob's versioned_hash
     * (aka blobhash) can be accessed and stored for later. It seems you can only
     * access the blobhash in the tx in which the blob was submitted.
     */
    function submitBlobs() external {
        /**
         * blobhash() eturns the versioned_hash of the i-th blob associated with _this_ transaction.
         * bytes[0:1]: 0x01
         * bytes[1:32]: the last 31 bytes of the sha256 hash of the kzg commitment C.
         */
        bytes32 blobHash;
        assembly {
            blobHash := blobhash(0)
        }
        blobHashes[txId][0] = blobHash;
        emit BlobHash(txId, blobHash);

        ++txId;
    }

    // /**
    //  * Input bytes:
    //  * input[:32]     - versioned_hash
    //  * input[32:64]   - z
    //  * input[64:96]   - y
    //  * input[96:144]  - commitment C
    //  * input[144:192] - proof (a commitment to the quotient polynomial q(X))
    //  *
    //  * where:
    //  *     p(X) interpolates the values in the blob, at roots of unity [^1]
    //  *     p(z) = y
    //  *     Commitment C is the kzg commitment of p(X)
    //  *     Proof is the kzg commitment of q(X) = (p(X) - p(z))/(X - z)
    //  *
    //  * Note: the roots of unity are arranged in bit-reversal permutation, so you'll need a library to play with this stuff. You won't be able to mentally play with the polynomials.
    //  */
    function verifyKzgProof(bytes calldata input, uint256 _txId) public {
        // bytes memory output;
        // bool success;

        require(blobHashes[_txId][0] == bytes32(input[0:32]));

        // Call the point evaluation precompile: https://eips.ethereum.org/EIPS/eip-4844#point-evaluation-precompile
        // assembly {
        //     /*
        //         gasLimit: calling with gas equal to not(0), as we have here, will send all available gas to the function being called. This removes the need to guess or upper-bound the amount of gas being sent yourself. As an alternative, we could have guessed the gas needed: with: sub(gas, 2000)
        //         to: the sha256 precompile is at address 0x2: Sending the amount of gas currently available to us, after subtracting 2000;
        //         value: 0 (no ether will be sent to the contract)
        //         inputOffset: The memory offset of the input data
        //         inputSize: hex input size = 0xc0 = 192 bytes
        //         outputOffset: where will the output be stored (in variable `output` in our case)
        //         outputSize: 2 * 32-bytes = 0x40 in hex
        //     */
        //     let inPtr := mload(0x40)
        //     calldatacopy(inPtr, input.offset, input.length)
        //     success := call(not(0), 0x0a, 0, inPtr, 0xc0, output, 0x40)
        //     // Use "invalid" to make gas estimation work
        //     switch success
        //     case 0 {
        //         invalid()
        //     }
        // }

        // Staticcall the point eval precompile:
        (bool success, bytes memory data) = address(0x0a).staticcall(input);

        require(success, "Point evaluation precompile failed");

        // Validate that it actually actually succeeded:
        (uint256 fieldElementsPerBlob, uint256 blsModulus) = abi.decode(
            data,
            (uint256, uint256)
        );

        require(
            fieldElementsPerBlob == FIELD_ELEMENTS_PER_BLOB,
            "Point eval precompile failed"
        );
        require(blsModulus == BLS_MODULUS, "Point eval precompile failed");

        emit PointEvaluationSuccess(success);
    }
}
