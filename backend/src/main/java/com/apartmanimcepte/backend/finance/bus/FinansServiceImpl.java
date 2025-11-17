package com.apartmanimcepte.backend.finance.bus;

import com.apartmanimcepte.backend.finance.Enum.BorcTuruEnum;
import com.apartmanimcepte.backend.finance.dao.*;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.GiderCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.*;
import com.apartmanimcepte.backend.finance.entity.*;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import com.apartmanimcepte.backend.structure.dao.DaireDAO;
import com.apartmanimcepte.backend.structure.dao.SiteDAO;
import com.apartmanimcepte.backend.structure.entity.Daire;
import com.apartmanimcepte.backend.structure.entity.Site;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FinansServiceImpl implements FinansService {

    private final SiteDAO siteDAO;
    private final DaireDAO daireDAO;
    private final DaireBorcDAO daireBorcDAO;
    private final BorcTanimiDAO borcTanimiDAO;
    private final BorcOdemeIsteklerDAO borcOdemeIsteklerDAO;
    private final GiderDAO giderDAO;
    private final GiderBelgeDAO giderBelgeDAO;

    public FinansServiceImpl(SiteDAO siteDAO, DaireDAO daireDAO, DaireBorcDAO daireBorcDAO, BorcTanimiDAO borcTanimiDAO, BorcOdemeIsteklerDAO borcOdemeIsteklerDAO, BorcOdemeIsteklerDAO borcOdemeIsteklerDAO1, GiderDAO giderDAO, GiderBelgeDAO giderBelgeDAO) {
        this.siteDAO = siteDAO;
        this.daireDAO = daireDAO;

        this.daireBorcDAO = daireBorcDAO;
        this.borcTanimiDAO = borcTanimiDAO;
        this.borcOdemeIsteklerDAO = borcOdemeIsteklerDAO1;
        this.giderDAO = giderDAO;
        this.giderBelgeDAO = giderBelgeDAO;
    }

    @Override
    @Transactional
    public ResponseDTO borcTanim(BorcTanimiCreateRequestDTO borcTanimiCreateRequestDto) {
        BorcTanimi borcTanimi = new BorcTanimi();
        BorcTuruEnum borcTuruEnum = BorcTuruEnum.AIDAT;
        BigDecimal bolunMusBorc = new BigDecimal(0);
        Site site = siteDAO.getObjectById(Site.class, borcTanimiCreateRequestDto.getSiteId());
        borcTanimi.setSite(site);
        borcTanimi.setBorcTuru(borcTanimiCreateRequestDto.getBorcTuru());
        borcTanimi.setTutar(borcTanimiCreateRequestDto.getTutar());
        borcTanimi.setAciklama(borcTanimiCreateRequestDto.getAciklama());
        borcTanimi.setOlusturulmaTarihi(LocalDate.now());
        borcTanimi.setSonOdemeTarihi(borcTanimiCreateRequestDto.getSonOdemeTarihi());
        borcTanimiDAO.saveOrUpdate(borcTanimi);
        List<Long> daireIdList = daireDAO.getDaireIdsBySiteId(site.getSiteId());
        //eğer aidat ise bu çalışacak ve girilen tutar direkt dairelere yansıyacak.
        if (borcTanimiCreateRequestDto.getBorcTuru().equals(borcTuruEnum)) {
            for (Long daireId : daireIdList) {
                Daire daire = daireDAO.getObjectById(Daire.class, daireId);
                DaireBorc daireBorc = new DaireBorc();
                daireBorc.setDaire(daire);
                daireBorc.setBorcTanimi(borcTanimi);
                daireBorc.setTutar(borcTanimiCreateRequestDto.getTutar());
                daireBorcDAO.saveOrUpdate(daireBorc);

            }
        } else {//eğer girilen aidat değil özel masrafsa (örneğin dış cephe tamiratı gibi) tüm dairelere eşit bölünür set edilir.
            int size = daireIdList.size();
            bolunMusBorc = borcTanimiCreateRequestDto.getTutar();
            bolunMusBorc = bolunMusBorc.divide(BigDecimal.valueOf(size), 2, RoundingMode.HALF_UP);
            for (Long daireId : daireIdList) {
                Daire daire = daireDAO.getObjectById(Daire.class, daireId);
                DaireBorc daireBorc = new DaireBorc();
                daireBorc.setDaire(daire);
                daireBorc.setBorcTanimi(borcTanimi);
                daireBorc.setTutar(bolunMusBorc);
                daireBorcDAO.saveOrUpdate(daireBorc);

            }
        }

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setMessage("Ödeme bilgisi başarılı bir şekilde eklendi.");
        return responseDTO;
    }

    @Override
    @Transactional
    public List<BorcTanimiResponseDTO> tanimlananBorclar(TanimlanmisBorcFiltreDTO tanimlanmisBorcFiltreDTO) {
        return borcTanimiDAO.getTanimlananBorclar(tanimlanmisBorcFiltreDTO);
    }

    @Override
    @Transactional
    public List<DaireBorcResponseDTO> daireBorclar(Long borcId) {
        BorcTanimi borcTanimi= borcTanimiDAO.getObjectById(BorcTanimi.class, borcId);
        List<DaireBorc> daireBorcs = daireBorcDAO.getObjectsByParam(DaireBorc.class, "borcTanimi", borcTanimi);
        List<DaireBorcResponseDTO> daireBorcResponseDTOS = new ArrayList<>();
        for (DaireBorc daireBorc : daireBorcs) {
            Daire daire = daireDAO.getObjectById(Daire.class, daireBorc.getDaire().getDaireId());
            DaireBorcResponseDTO daireBorcResponseDTO = new DaireBorcResponseDTO();
            daireBorcResponseDTO.setId(daireBorc.getId());
            daireBorcResponseDTO.setDaireNo(daireBorc.getDaire().getDaireNo());
            daireBorcResponseDTO.setTutar(daireBorc.getTutar());
            daireBorcResponseDTO.setDaireId(daireBorc.getDaire().getDaireId());
            daireBorcResponseDTO.setDaireKat(daire.getKatNo());
            daireBorcResponseDTO.setDaireBlok(daire.getBlok().getBlokIsmi());
            daireBorcResponseDTO.setBorcAciklamasi(borcTanimi.getAciklama());
            daireBorcResponseDTO.setSonOdemeTarihi(borcTanimi.getSonOdemeTarihi());
            daireBorcResponseDTO.setOdemeTarihi(daireBorc.getOdemeTarihi());
            daireBorcResponseDTO.setOdendiMi(daireBorc.isOdendiMi());
            daireBorcResponseDTOS.add(daireBorcResponseDTO);
        }

        return daireBorcResponseDTOS;
    }

    @Override
    @Transactional
    public List<DaireBorcResponseDTO> daireBorc(Long daireId) {
        return daireBorcDAO.getDaireBorc(daireId);
    }

    @Override
    @Transactional
    public ResponseDTO borcIstekKabul(Long daireBorcId) {
        DaireBorc daireBorc = daireBorcDAO.getObjectById(DaireBorc.class, daireBorcId);
        List<BorcOdemeIstekler> borcOdemeIstekler = borcOdemeIsteklerDAO.getObjectsByParam(BorcOdemeIstekler.class, "daireBorc", daireBorc);
        BorcOdemeIstekler borcOdemeIstekler1 = borcOdemeIstekler.get(0);
        ResponseDTO responseDTO = new ResponseDTO();
        if (daireBorc.isOdendiMi()) {
            responseDTO.setMessage("Seçilen dairenin borcu ödenmiş.");
        } else {
            borcOdemeIstekler1.setOnaylandiMi(true);
            borcOdemeIstekler1.setOnayTarihi(LocalDate.now());
            daireBorc.setOdendiMi(true);
            daireBorc.setOdemeTarihi(borcOdemeIstekler1.getIstekTarihi());
            daireBorcDAO.saveOrUpdate(daireBorc);
            borcOdemeIsteklerDAO.saveOrUpdate(borcOdemeIstekler1);
            responseDTO.setMessage("Borc odeme işlemi başarılı şekilde onaylanmıştır.");
        }
        return responseDTO;
    }

    @Override
    @Transactional
    public ResponseDTO borcOdemeIstegiGonder(Long daireBorcId) {
        ResponseDTO responseDTO = new ResponseDTO();
        DaireBorc daireBorc = daireBorcDAO.getObjectById(DaireBorc.class, daireBorcId);
        if (daireBorc.isOdendiMi()) {
            responseDTO.setMessage("Bu borç zaten ödenmiş durumdadır.");
            return responseDTO;
        }
        Optional<BorcOdemeIstekler> existingRequest = borcOdemeIsteklerDAO.findPendingRequestByDaireBorc(daireBorc);

        if (existingRequest.isPresent()) {
            responseDTO.setMessage("Bu borç için zaten bir ödeme onayı bekleniyor.");
            return responseDTO;
        }

        BorcOdemeIstekler borcOdemeIstekler = new BorcOdemeIstekler();
        borcOdemeIstekler.setDaireBorc(daireBorc);
        borcOdemeIstekler.setIstekTarihi(LocalDate.now());
        borcOdemeIsteklerDAO.saveOrUpdate(borcOdemeIstekler);

        responseDTO.setMessage("Borç ödeme isteğiniz yöneticinize iletildi. Onaylandıktan sonra 'Ödendi' olarak yansıyacaktır.");
        return responseDTO;
    }

    @Override
    @Transactional
    public List<BorcOdemeIstekResponseDTO> borcOdemeIstekler(Long siteId) {
        return borcOdemeIsteklerDAO.getOdemeIstekler(siteId);
    }

    @Override
    @Transactional
    public BorcOdemeIstekDurumResponseDTO borcOdemeIstekDurum(Long daireBorcId) {
        DaireBorc daireBorc = daireBorcDAO.getObjectById(DaireBorc.class, daireBorcId);
        BorcOdemeIstekDurumResponseDTO responseDTO=  new BorcOdemeIstekDurumResponseDTO();
        List<BorcOdemeIstekler> borcOdemeIsteklers = borcOdemeIsteklerDAO.getObjectsByParam(BorcOdemeIstekler.class,"daireBorc",daireBorc);
        if(borcOdemeIsteklers.isEmpty()){
           responseDTO.setOnaylandiMi(false);
           responseDTO.setMessage(null);
        }
        BorcOdemeIstekler borcOdemeIstekler = borcOdemeIsteklers.get(0);
        if(borcOdemeIstekler.isOnaylandiMi())
        {
            responseDTO.setOnaylandiMi(true);
            responseDTO.setMessage("Onaylandı");
            return responseDTO;
        }else{
            responseDTO.setOnaylandiMi(false);
            responseDTO.setMessage("Onay Bekliyor");
            return responseDTO;
        }
    }

    @Override
    @Transactional
    public TotalApartmanGelirResponseDTO totalApartmanGelir(Long siteId) {
        return daireBorcDAO.getTotalApartmanGelir(siteId);
    }

    @Override
    @Transactional
    public ResponseDTO giderEkle(GiderCreateRequestDTO giderCreateRequestDTO, MultipartFile[] dosyalar) {
        try {
            // Gider kaydını oluştur ve kaydet
            Gider gider = new Gider();
            Site site = siteDAO.getObjectById(Site.class, giderCreateRequestDTO.getSiteId());
            gider.setGiderAciklama(giderCreateRequestDTO.getGiderAciklama());
            gider.setGiderTur(giderCreateRequestDTO.getGiderTur());
            gider.setGiderTutari(giderCreateRequestDTO.getGiderTutari());
            gider.setSite(site);
            gider.setGiderOlusturulmaTarihi(LocalDate.now());

            // Gider'i kaydet
            giderDAO.saveOrUpdate(gider);

            // Dosyalar varsa kaydet
            if (dosyalar != null && dosyalar.length > 0) {
                for (MultipartFile dosya : dosyalar) {
                    if (!dosya.isEmpty()) {
                        try {
                            String fileName = System.currentTimeMillis() + "_" + dosya.getOriginalFilename();

                            // Environment variable'dan upload path'i al
                            String uploadBasePath = System.getenv("UPLOAD_PATH");
                            if (uploadBasePath == null) {
                                // Local IntelliJ debug için
                                uploadBasePath = System.getProperty("user.dir") + "/uploads";
                            }

                            String klasorYolu = String.format("%s/giderler/site_%d/%d/%02d",
                                    uploadBasePath,
                                    gider.getSite().getSiteId(),
                                    LocalDate.now().getYear(),
                                    LocalDate.now().getMonthValue());

                            File klasor = new File(klasorYolu);
                            if (!klasor.exists()) {
                                klasor.mkdirs();
                            }

                            String dosyaYolu = klasorYolu + "/" + fileName;
                            File targetFile = new File(dosyaYolu);
                            dosya.transferTo(targetFile);

                            GiderBelge giderBelge = new GiderBelge();
                            giderBelge.setGider(gider);
                            giderBelge.setDosyaAdi(dosya.getOriginalFilename());
                            giderBelge.setDosyaYolu(dosyaYolu);
                            giderBelge.setDosyaTuru(getDosyaTuru(dosya.getContentType()));
                            giderBelge.setDosyaBoyutu(dosya.getSize());
                            giderBelge.setYuklemeTarihi(LocalDateTime.now());

                            giderBelgeDAO.saveOrUpdate(giderBelge);

                        } catch (IOException e) {
                            throw new RuntimeException("Dosya kaydedilemedi: " + e.getMessage());
                        }
                    }
                }
            }

            return new ResponseDTO("Gider başarıyla eklendi.", null);

        } catch (Exception e) {
            return new ResponseDTO("Gider eklenirken hata oluştu: " + e.getMessage(), null);
        }
    }
    @Override
    @Transactional
    public List<GiderResponseDTO> giderGetir(Long siteId) {
        Site site = siteDAO.getObjectById(Site.class, siteId);
        List<Gider> giderler = giderDAO.getObjectsByParam(Gider.class, "site", site);
        List<GiderResponseDTO> giderResponseDTOList = new ArrayList<>();

        for (Gider gider : giderler) {
            GiderResponseDTO responseDTO = new GiderResponseDTO();
            responseDTO.setGiderId(gider.getGiderId());
            responseDTO.setGiderTutari(gider.getGiderTutari());
            responseDTO.setGiderTur(gider.getGiderTur());
            responseDTO.setGiderAciklama(gider.getGiderAciklama());
            responseDTO.setGiderOlusturulmaTarihi(gider.getGiderOlusturulmaTarihi());
            responseDTO.setAktif(gider.getAktif());
            responseDTO.setSiteId(gider.getSite().getSiteId());
            responseDTO.setSiteIsmi(gider.getSite().getSiteIsmi());

            // Gidere ait belgeleri getir
            List<GiderBelge> belgeler = giderBelgeDAO.getObjectsByParam(GiderBelge.class, "gider", gider);
            List<GiderResponseDTO.GiderBelgeDTO> belgeDTOList = new ArrayList<>();

            for (GiderBelge belge : belgeler) {
                GiderResponseDTO.GiderBelgeDTO belgeDTO = new GiderResponseDTO.GiderBelgeDTO();
                belgeDTO.setGiderBelgeId(belge.getGiderBelgeId());
                belgeDTO.setDosyaAdi(belge.getDosyaAdi());
                belgeDTO.setDosyaTuru(belge.getDosyaTuru());
                belgeDTO.setDosyaBoyutu(belge.getDosyaBoyutu());
                belgeDTO.setYuklemeTarihi(belge.getYuklemeTarihi());

                // Download URL oluştur
                String downloadUrl = "/api/finance/gider/belge/indir/" + belge.getGiderBelgeId();
                belgeDTO.setDosyaUrl(downloadUrl);

                belgeDTOList.add(belgeDTO);
            }

            responseDTO.setBelgeler(belgeDTOList);
            giderResponseDTOList.add(responseDTO);
        }

        return giderResponseDTOList;
    }

    @Override
    @Transactional
    public TotalApartmanGiderResponseDTO totalApartmanGider(Long siteId) {
        return giderDAO.getTotalApartmanGider(siteId);
    }


    private String getDosyaTuru(String contentType) {
        if (contentType != null) {
            if (contentType.contains("pdf")) return "PDF";
            if (contentType.contains("image")) return "IMAGE";
        }
        return "OTHER";
    }


}
