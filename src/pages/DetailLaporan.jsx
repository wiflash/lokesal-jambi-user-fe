import React from "react";
import axios from "axios";
import swal from "sweetalert";
import { store, actions } from "../store/store";
import moment from "moment";
import "moment-timezone";
import "moment/locale/id";
import { withRouter } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Spinner,
  Form,
  Button,
  InputGroup,
  Carousel
} from "react-bootstrap";
import {
  FaChevronLeft,
  FaCircle,
  FaUser,
  FaRegCalendarAlt,
  FaHeadset,
  FaImage,
  FaHandHoldingHeart,
  FaComments,
  FaEllipsisH,
  FaGrinBeam,
  FaFrown
} from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import "../styles/kembali.css";
import "../styles/detailLaporan.css";
import NamaLokasi from "../components/namaLokasi";
import Komentar from "../components/komentar";
import { connect } from "unistore/react";

class DetailLaporan extends React.Component {
  state = {
    idPengguna: null,
    kepuasan: null,
    fotoSebelum: "",
    fotoSesudah: "",
    status: "",
    namaDepan: "",
    namaBelakang: "",
    anonim: false,
    isi: "",
    totalDukungan: 0,
    totalKomentar: 0,
    tanggapanAdmin: [],
    dibuat: "",
    diperbarui: "",
    loading: false,
    didukung: false,
    komentar: "",
    loadingKirimKomentar: false,
    daftarKomentar: [],
    halaman: 1,
    totalHalaman: 1,
    loadingLihatKomentar: false
  };

  kirimUlasan = ulasan => {
    const request = {
      method: "put",
      url: `${store.getState().urlBackend}/pengguna/keluhan/${
        this.props.match.params.id
      }`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      data: { kepuasan: ulasan }
    };
    axios(request)
      .then(() => {
        this.setState({ kepuasan: ulasan });
        swal(
          "Ulasan Berhasil Dikirim!",
          "Terima kasih atas masukan yang telah anda berikan.",
          "success"
        );
      })
      .catch(error => {
        swal("Gagal Kirim Ulasan!", error.response.data.pesan, "error");
      });
  };

  tambahDukungan = () => {
    if (localStorage.getItem("token") !== null) {
      const request = {
        method: "put",
        url: `${store.getState().urlBackend}/pengguna/keluhan/${
          this.props.match.params.id
        }/dukungan`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };
      axios(request)
        .then(response => {
          this.setState({
            didukung: response.data.dukung,
            totalDukungan: response.data.total_dukungan
          });
        })
        .catch(error => {
          if (error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("terverifikasi");
            localStorage.removeItem("id");
            swal({
              title: "Gagal Dukung!",
              text:
                "Akun anda telah dinonaktifkan. Silahkan hubungi Admin untuk informasi lebih lanjut.",
              icon: "error"
            });
            this.props.history.push("/masuk");
          }
        });
    } else {
      swal(
        "Gagal Dukung!",
        "Anda harus masuk supaya bisa mendukung laporan ini.",
        "error"
      );
    }
  };

  kirimKomentar = () => {
    if (localStorage.getItem("token") !== null) {
      this.setState({
        loadingKirimKomentar: true
      });
      const request = {
        method: "post",
        url: `${store.getState().urlBackend}/pengguna/keluhan/${
          this.props.match.params.id
        }/komentar`,
        data: { isi: this.state.komentar },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };
      axios(request)
        .then(response => {
          this.setState({
            daftarKomentar: this.state.daftarKomentar.concat([response.data]),
            totalKomentar: response.data.total_komentar,
            komentar: "",
            loadingKirimKomentar: false
          });
          window.scrollTo(0, document.body.scrollHeight);
        })
        .catch(error => {
          this.setState({ loadingKirimKomentar: false });
          if (error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("terverifikasi");
            localStorage.removeItem("id");
            swal({
              title: "Gagal Kirim Komentar!",
              text:
                "Akun anda telah dinonaktifkan. Silahkan hubungi Admin untuk informasi lebih lanjut.",
              icon: "error"
            });
            this.props.history.push("/masuk");
          }
        });
    } else {
      this.setState({
        loadingKirimKomentar: false
      });
      swal(
        "Gagal Kirim Komentar!",
        "Anda harus masuk supaya bisa memberikan komentar anda.",
        "error"
      );
    }
  };

  lihatKomentar = () => {
    this.setState({ loadingLihatKomentar: true });
    const requestKomentar = {
      method: "get",
      url: `${store.getState().urlBackend}/keluhan/${
        this.props.match.params.id
      }/komentar?halaman=${this.state.halaman + 1}&per_halaman=5`,
      headers: {
        "Content-Type": "application/json"
      }
    };
    axios(requestKomentar)
      .then(response => {
        this.setState({
          daftarKomentar: response.data.daftar_komentar.concat(
            this.state.daftarKomentar
          ),
          totalKomentar: response.data.total_komentar,
          halaman: response.data.halaman,
          totalHalaman: response.data.total_halaman,
          loadingLihatKomentar: false
        });
      })
      .catch(() => this.setState({ loadingLihatKomentar: false }));
  };

  laporkanKomentar = id => {
    swal({
      title: "Anda yakin mau melaporkan komentar ini?",
      icon: "warning",
      buttons: ["Tidak", "Ya"],
      dangerMode: "Ya"
    }).then(willDelete => {
      if (willDelete) {
        const request = {
          method: "put",
          url: `${store.getState().urlBackend}/pengguna/keluhan/komentar/${id}`,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        };
        axios(request)
          .then(() => {
            swal("Laporkan Komentar Berhasil!", "", "success");
          })
          .catch(error => {
            if (error.response.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("terverifikasi");
              localStorage.removeItem("id");
              swal({
                title: "Gagal Masuk!",
                text:
                  "Akun anda telah dinonaktifkan. Silahkan hubungi Admin untuk informasi lebih lanjut.",
                icon: "error"
              });
              this.props.history.push("/masuk");
            } else {
              swal("Laporkan Komentar Gagal!", "", "error");
            }
          });
      }
    });
  };

  componentDidMount = () => {
    this.setState({ loading: true });
    // Get data detail keluhan
    const request = {
      method: "get",
      url: `${store.getState().urlBackend}/keluhan/${
        this.props.match.params.id
      }?kota=${store.getState().namaKota}`,
      headers: { "Content-Type": "application/json" }
    };
    axios(request)
      .then(response => {
        this.setState({
          idPengguna: response.data.id_pengguna,
          kepuasan: response.data.kepuasan,
          fotoSebelum: response.data.foto_sebelum,
          fotoSesudah: response.data.foto_sesudah,
          status: response.data.status,
          namaDepan: response.data.nama_depan,
          namaBelakang: response.data.nama_belakang,
          anonim: response.data.anonim,
          isi: response.data.isi,
          totalDukungan: response.data.total_dukungan,
          totalKomentar: response.data.total_komentar,
          tanggapanAdmin: response.data.tanggapan_admin,
          dibuat: response.data.dibuat,
          diperbarui: response.data.diperbarui,
          loading: false
        });
        this.props.getLokasi([response.data.longitude, response.data.latitude]);
      })
      .catch(() => this.setState({ loading: false }));
    // Get data user mendukung atau tidak
    if (localStorage.getItem("token") !== null) {
      const requestDukung = {
        method: "get",
        url: `${store.getState().urlBackend}/pengguna/keluhan/${
          this.props.match.params.id
        }/dukungan`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      };
      axios(requestDukung)
        .then(response => {
          this.setState({
            didukung: response.data.dukung
          });
        })
        .catch(error => {
          if (error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("terverifikasi");
            localStorage.removeItem("id");
            swal({
              title: "Gagal Masuk!",
              text:
                "Akun anda telah dinonaktifkan. Silahkan hubungi Admin untuk informasi lebih lanjut.",
              icon: "error"
            });
            this.props.history.push("/masuk");
          }
        });
    }
    // Get data daftar komentar
    const requestKomentar = {
      method: "get",
      url: `${store.getState().urlBackend}/keluhan/${
        this.props.match.params.id
      }/komentar?halaman=1&per_halaman=5`,
      headers: {
        "Content-Type": "application/json"
      }
    };
    axios(requestKomentar).then(response => {
      this.setState({
        daftarKomentar: response.data.daftar_komentar,
        halaman: response.data.halaman,
        totalHalaman: response.data.total_halaman
      });
    });
  };

  render() {
    return (
      <React.Fragment>
        <Container fluid className="kembali">
          <Row>
            <Col className="kembali-col">
              <div
                className="kembali-div"
                onClick={() => this.props.history.goBack()}
              >
                <span className="kembali-icon">
                  <FaChevronLeft />
                </span>
                <span className="kembali-nama"> Kembali</span>
              </div>
            </Col>
          </Row>
        </Container>
        {this.state.loading ? (
          <Container fluid className="detaillaporan-loading">
            <Row>
              <Col>
                <Spinner variant="success" animation="grow" />
              </Col>
            </Row>
          </Container>
        ) : (
          <div
            className={
              localStorage.getItem("token") === null
                ? "detaillaporan"
                : "detaillaporan detaillaporan-bottom"
            }
          >
            {this.state.idPengguna === localStorage.getItem("id") * 1 &&
            this.state.kepuasan === null &&
            this.state.status === "selesai" ? (
              <Container fluid className="detaillaporan-kepuasan">
                <Row>
                  <Col>
                    <p>
                      Bagaimana penilaianmu terhadap proses dan hasil kerja kami
                      dalam menyelesaikan permasalahan ini?
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Col xs="2"></Col>
                  <Col
                    className="text-danger"
                    style={{ paddingRight: 0 }}
                    onClick={() => this.kirimUlasan("tidak_puas")}
                  >
                    <h3>
                      <FaFrown />
                    </h3>
                    <h4>Kurang Puas</h4>
                  </Col>
                  <Col
                    className="text-success"
                    style={{ paddingLeft: 0 }}
                    onClick={() => this.kirimUlasan("puas")}
                  >
                    <h3>
                      <FaGrinBeam />
                    </h3>
                    <h4>Puas</h4>
                  </Col>
                  <Col xs="2"></Col>
                </Row>
              </Container>
            ) : (
              <div></div>
            )}
            {this.state.status === "selesai" ? (
              <div className="detaillaporan-luarcarousel">
                <Carousel className="detaillaporan-carousel">
                  <Carousel.Item>
                    {this.state.fotoSebelum === "" ? (
                      <div className="detaillaporan-carouselkosong">
                        <FaImage />
                      </div>
                    ) : (
                      <img
                        className="d-block w-100"
                        src={this.state.fotoSebelum}
                        alt="foto sebelum"
                      />
                    )}
                    <Carousel.Caption>
                      <p>Foto Sebelum</p>
                    </Carousel.Caption>
                  </Carousel.Item>
                  <Carousel.Item>
                    {this.state.fotoSesudah === "" ? (
                      <div className="detaillaporan-carouselkosong">
                        <FaImage />
                      </div>
                    ) : (
                      <img
                        className="d-block w-100"
                        src={this.state.fotoSesudah}
                        alt="foto sebelum"
                      />
                    )}
                    <Carousel.Caption>
                      <p>Foto Sesudah</p>
                    </Carousel.Caption>
                  </Carousel.Item>
                </Carousel>
              </div>
            ) : (
              <Container fluid className="detaillaporan-fotosebelum">
                <Row>
                  <Col>
                    {this.state.fotoSebelum === "" ? (
                      <div className="detaillaporan-fotosebelum-foto">
                        <FaImage />
                      </div>
                    ) : (
                      <img alt="foto sebelum" src={this.state.fotoSebelum} />
                    )}
                  </Col>
                </Row>
              </Container>
            )}
            <Container fluid className="detaillaporan-status">
              <Row>
                {this.state.status === "diterima" ? (
                  <Col>
                    <div
                      className="detaillaporan-status-lingkaran"
                      style={{ color: "red" }}
                    >
                      <FaCircle />
                    </div>{" "}
                    Keluhan Diterima
                  </Col>
                ) : this.state.status === "diproses" ? (
                  <Col>
                    <div
                      className="detaillaporan-status-lingkaran"
                      style={{ color: "rgb(255, 180, 0)" }}
                    >
                      <FaCircle />
                    </div>{" "}
                    Sedang Diproses
                  </Col>
                ) : (
                  <Col>
                    <div
                      className="detaillaporan-status-lingkaran"
                      style={{ color: "green" }}
                    >
                      <FaCircle />
                    </div>{" "}
                    Laporan Selesai
                  </Col>
                )}
              </Row>
            </Container>
            {this.props.loadingLokasiUser ? (
              <Container fluid className="namalokasi">
                <Row>
                  <Col className="namalokasi-loading">
                    <Spinner animation="grow" variant="success" />
                  </Col>
                </Row>
              </Container>
            ) : (
              <NamaLokasi lokasi={this.props.lokasiUser} />
            )}
            <Container fluid className="detaillaporan-keluhan">
              <Row>
                <Col>
                  <div className="detaillaporan-keluhan-icon">
                    <FaUser />
                  </div>{" "}
                  {this.state.anonim
                    ? "Anonim"
                    : `${this.state.namaDepan} ${this.state.namaBelakang}`}
                </Col>
              </Row>
              <Row>
                <Col style={{ fontWeight: "normal" }}>
                  <div className="detaillaporan-keluhan-icon">
                    <FaRegCalendarAlt />
                  </div>{" "}
                  {moment(`${this.state.dibuat}Z`)
                    .tz("Asia/Jakarta")
                    .format("LL")}{" "}
                  {moment(`${this.state.dibuat}Z`).format("HH:mm")} WIB
                </Col>
              </Row>
              <Row className="detaillaporan-isi">
                <Col>{this.state.isi}</Col>
              </Row>
            </Container>
            {this.state.status === "diproses" ||
            this.state.status === "selesai" ? (
              <Container fluid className="detaillaporan-keluhan">
                <Row>
                  <Col>
                    <div className="detaillaporan-keluhan-icon">
                      <FaHeadset />
                    </div>{" "}
                    Tanggapan Admin
                  </Col>
                </Row>
                <Row>
                  <Col style={{ fontWeight: "normal" }}>
                    <div className="detaillaporan-keluhan-icon">
                      <FaRegCalendarAlt />
                    </div>{" "}
                    {moment(`${this.state.diperbarui}Z`)
                      .tz("Asia/Jakarta")
                      .format("LL")}{" "}
                    {moment(`${this.state.diperbarui}Z`).format("HH:mm")} WIB
                  </Col>
                </Row>
                <Row className="detaillaporan-isi">
                  <Col>
                    {
                      this.state.tanggapanAdmin[
                        this.state.tanggapanAdmin.length - 1
                      ].isi
                    }
                  </Col>
                </Row>
              </Container>
            ) : (
              <div></div>
            )}
            <Container fluid className="detaillaporan-dukungan">
              <Row>
                <Col>
                  {this.state.didukung ? (
                    <div
                      className="detaillaporan-keluhan-icon"
                      onClick={() => this.tambahDukungan()}
                    >
                      <FaHandHoldingHeart />
                    </div>
                  ) : (
                    <div
                      className="detaillaporan-dukungan-icon"
                      onClick={() => this.tambahDukungan()}
                    >
                      <FaHandHoldingHeart />
                    </div>
                  )}
                  {this.state.totalDukungan} dukungan
                </Col>
                <Col xs="auto">
                  <div className="detaillaporan-keluhan-icon">
                    <FaComments />
                  </div>{" "}
                  {this.state.totalKomentar} komentar
                </Col>
              </Row>
            </Container>
            {this.state.loadingLihatKomentar ? (
              <Container fluid className="detaillaporan-loadingkomentar">
                <Row>
                  <Col>
                    <Spinner variant="success" animation="grow" />
                  </Col>
                </Row>
              </Container>
            ) : this.state.halaman === this.state.totalHalaman ? (
              <div></div>
            ) : (
              <Container fluid className="detaillaporan-lihatkomentar">
                <Row>
                  <Col>
                    <h6 onClick={() => this.lihatKomentar()}>
                      Lihat komentar sebelumnya
                    </h6>
                  </Col>
                </Row>
              </Container>
            )}
            {this.state.daftarKomentar.map(item => {
              return (
                <Komentar
                  id={item.detail_komentar.id}
                  namaDepan={item.nama_depan}
                  namaBelakang={item.nama_belakang}
                  avatar={item.avatar}
                  isi={item.detail_komentar.isi}
                  dibuat={item.detail_komentar.dibuat}
                  laporkanKomentar={this.laporkanKomentar}
                />
              );
            })}
          </div>
        )}
        {localStorage.getItem("token") === null ? (
          <div></div>
        ) : (
          <Container fluid className="detaillaporan-tambahkomentar">
            <Row>
              <Col>
                <Form onSubmit={event => event.preventDefault()}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Kirim komentar anda"
                      value={this.state.komentar}
                      onChange={event =>
                        this.setState({ komentar: event.target.value })
                      }
                      onClick={() =>
                        window.scrollTo(0, document.body.scrollHeight)
                      }
                    />
                    <InputGroup.Append>
                      {this.state.loadingKirimKomentar ? (
                        <Button variant="success" disabled>
                          <FaEllipsisH />
                        </Button>
                      ) : this.state.komentar === "" ? (
                        <Button variant="success" disabled>
                          <IoMdSend />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          variant="success"
                          onClick={() => this.kirimKomentar()}
                        >
                          <IoMdSend />
                        </Button>
                      )}
                    </InputGroup.Append>
                  </InputGroup>
                </Form>
              </Col>
            </Row>
          </Container>
        )}
      </React.Fragment>
    );
  }
}

export default connect(
  "lokasiUser, loadingLokasiUser",
  actions
)(withRouter(DetailLaporan));
