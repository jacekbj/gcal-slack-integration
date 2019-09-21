const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();

const collectionName = 'refresh_tokens';

module.exports.collectionName = collectionName;

module.exports.forEachToken = function forEachToken(docCb, finishedCb) {
    const query = firestore.collection(collectionName);
    let count = 0;

    query.stream().on('data', (documentSnapshot) => {
        docCb(documentSnapshot.data());
        ++count;
    }).on('end', () => {
        if (finishedCb) {
            finishedCb(count);
        }
    });
};

module.exports.setOrUpdate = function setOrUpdate(docId, data) {
    return firestore
        .doc(docId)
        .set(data, { merge: true});
};
