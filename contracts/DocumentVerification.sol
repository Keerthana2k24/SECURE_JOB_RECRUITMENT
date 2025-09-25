// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentVerification {
    mapping(bytes32 => bool) private documentHashes;
    event DocumentUploaded(address indexed uploader, bytes32 documentHash);

    function uploadDocument(bytes32 documentHash) public {
        require(!documentHashes[documentHash], "Document hash already exists");
        documentHashes[documentHash] = true;
        emit DocumentUploaded(msg.sender, documentHash);
    }

    function verifyDocument(bytes32 documentHash) public view returns (bool) {
        return documentHashes[documentHash];
    }
}
