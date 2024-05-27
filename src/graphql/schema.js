const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Query {
    hello: String
  }

  type Barang {
    rfid: String
    namaBarang: String
    hargaSatuan: Float
  }

  type CheckinBarangResponse {
    success: Boolean
    message: String
    barang: Barang
  }

  type TransaksiResponse {
    message: String
  }

  input TransaksiInput {
    qrCode: String!
    rfid: String!
    hargaSatuan: Float!
    jumlah: Int!
  }

  type Mutation {
    checkinBarang(rfid: String!): CheckinBarangResponse
    simpanTransaksi(transaksi: TransaksiInput!): TransaksiResponse
    transferTransaksiToPostgres: String
  }
`;

module.exports = { typeDefs };
