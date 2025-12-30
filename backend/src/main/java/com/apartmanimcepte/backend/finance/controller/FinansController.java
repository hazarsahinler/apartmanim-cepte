package com.apartmanimcepte.backend.finance.controller;

import com.apartmanimcepte.backend.finance.Enum.GiderTurEnum;
import com.apartmanimcepte.backend.finance.bus.FinansService;
import com.apartmanimcepte.backend.finance.dao.GiderBelgeDAO;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.GiderCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.*;
import com.apartmanimcepte.backend.finance.entity.GiderBelge;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;


import jakarta.transaction.Transactional;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class FinansController {

    private final FinansService finansService;
    private final GiderBelgeDAO giderBelgeDAO;

    public FinansController(FinansService finansService, GiderBelgeDAO giderBelgeDAO) {
        this.finansService = finansService;
        this.giderBelgeDAO = giderBelgeDAO;
    }

    /**
     * dairelere borc eklemek için kullanıyoruz. Testleri başarılı.
     *
     * @param borcTanimiCreateRequestDto
     * @return
     *///     * @param borcTanimiCreateRequestDto
    @PostMapping("/finance/borc/ekle")
    public ResponseDTO borcEkle(@RequestBody BorcTanimiCreateRequestDTO borcTanimiCreateRequestDto) {
        return finansService.borcTanim(borcTanimiCreateRequestDto);
    }

    /**
     * Tüm borçları çekiyoruz.Filtreye göre.Test başarılı.
     *
     * @param tanimlanmisBorcFiltreDTO
     * @return
     */
    @GetMapping("/finance/eklenen/borclar")
    public List<BorcTanimiResponseDTO> eklenenBorclar(TanimlanmisBorcFiltreDTO tanimlanmisBorcFiltreDTO) {
        return finansService.tanimlananBorclar(tanimlanmisBorcFiltreDTO);
    }

    /**
     * BorcIdsine göre dairelerin borçlarını döndürmek için.Test başarılı.
     *
     * @param borcId
     * @return
     * @throws IOException
     */

    @GetMapping("/finance/daireler/borc/{borcId}")
    public List<DaireBorcResponseDTO> daireBorcResponseDTOS(@PathVariable("borcId") Long borcId) throws IOException {
        return finansService.daireBorclar(borcId);
    }

    /**
     * DaireId ile daireye ait verileri döndürmek için kullanılıyor.
     *
     * @param daireId
     * @return
     * @throws IOException
     */
    @GetMapping("/finance/daire/borc/{daireId}")
    public List<DaireBorcResponseDTO> daireBorcResponseDTOList(@PathVariable("daireId") Long daireId) throws IOException {
        return finansService.daireBorc(daireId);
    }

    /**
     * Site Idsi alarak kullanıcıdan gelen borc odeme isteklerinin takibi.
     *
     * @param siteId
     * @return
     * @throws IOException
     */
    @GetMapping("/finance/odeme/istekler/{siteId}")
    public List<BorcOdemeIstekResponseDTO> borcOdemeIstekler(@PathVariable("siteId") Long siteId) throws IOException {
        return finansService.borcOdemeIstekler(siteId);
    }

    /**
     * Daire borc Id ile isteklerin kabul edilmesi
     *
     * @param daireBorcId
     * @return
     * @throws IOException
     */
    @PostMapping("/finance/odeme/istek/kabul/{daireBorcId}")
    public ResponseDTO borcOde(@PathVariable("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcIstekKabul(daireBorcId);
    }

    /**
     * Daire sakini bu api vasıtasıyla yöneticiye ödedim onayla diyecek.
     *
     * @param daireBorcId
     * @return
     * @throws IOException
     */
    @PostMapping("/finance/odeme/istek/gonder/{daireBorcId}")
    public ResponseDTO borcOdemeIstegiGonder(@PathVariable("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcOdemeIstegiGonder(daireBorcId);
    }

    /**
     * Daire sakini borç ödeme isteği gönderdiğinde, isteğin beklendiğini görmesi için borc ödeme istekler kısmını kontrol edeceğiz.
     * EĞer borç ödeme isteğinde o borçId ile onaylanmamış kayıt varsa UI kısmında "ONAY BEKLENİYOR" yazacak.
     * Eğer onaylanmış ise, "ONAYLANDI" yazak.
     */
    @GetMapping("/finance/odeme/istek/onay/durum/{daireBorcId}")
    public BorcOdemeIstekDurumResponseDTO borcOdemeIstekDurumKontrol(@PathVariable("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcOdemeIstekDurum(daireBorcId);
    }

    /**
     * Daire borç tablosunda bulunan ödendiMi bilgisi == TRUE olan kayıtları bulup tutarlarını toplayarak toplam geliri döndürür.
     * Amaç total geliri görebilmesi daire sakinin.
     */
    @GetMapping("/finance/total/gelir/{siteId}")
    public TotalApartmanGelirResponseDTO totalApartmanGelir(@PathVariable("siteId") Long siteId) throws IOException {
        return finansService.totalApartmanGelir(siteId);

    }

    /**
     * Yönetici gider ekleyecek ve bu giderin dosyasını yükleyecek.
     */
    @PostMapping("/finance/gider/ekle")
    public ResponseDTO giderEkle(
            @RequestParam("giderTutari") BigDecimal giderTutari,
            @RequestParam("giderTur") String giderTur,
            @RequestParam("giderAciklama") String giderAciklama,
            @RequestParam("siteId") Long siteId,
            @RequestParam(value = "giderTarihi", required = false) LocalDate giderTarihi,
            @RequestParam(value = "dosyalar", required = false) MultipartFile[] dosyalar) throws IOException {
        try {
            GiderCreateRequestDTO request = new GiderCreateRequestDTO();
            request.setGiderTutari(giderTutari);
            request.setGiderTur(GiderTurEnum.valueOf(giderTur));
            request.setGiderAciklama(giderAciklama);
            request.setSiteId(siteId);
            request.setGiderTarihi(giderTarihi);

            if (giderTutari == null || giderTutari.compareTo(BigDecimal.ZERO) <= 0) {
                return new ResponseDTO("Gider tutarı pozitif bir değer olmalıdır.", null);
            }
            ResponseDTO responseDTO = finansService.giderEkle(request, dosyalar);

            return responseDTO;

        } catch (Exception e) {
            return new ResponseDTO("Gider eklenirken hata oluştu: " + e.getMessage(), null);
        }
    }

    /**
     * SiteId parametresi ile o siteye bağlı gider ve gider dosyalarını getireceğiz.
     */
    @GetMapping("/finance/gider/getir/{siteId}")
    public List<GiderResponseDTO> getGiderler(@PathVariable Long siteId) {
        return finansService.giderGetir(siteId);
    }

    @GetMapping("/finance/gider/belge/goster/{belgeId}")
    @Transactional
    public ResponseEntity<Resource> belgeGoster(@PathVariable Long belgeId) {
        try {
            GiderBelge belge = giderBelgeDAO.getObjectById(GiderBelge.class, belgeId);
            File file = new File(belge.getDosyaYolu());
            Resource resource = new FileSystemResource(file);

            String contentType;
            if (belge.getDosyaTuru().equals("PDF")) {
                contentType = "application/pdf";
            } else if (belge.getDosyaTuru().equals("IMAGE")) {
                contentType = "image/jpeg"; // veya image/png
            } else {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + belge.getDosyaAdi() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    /**
     * Toplam Gider hesabı için api
     */
    @GetMapping("/finance/total/gider/{siteId}")
    public TotalApartmanGiderResponseDTO totalApartmanGider(@PathVariable("siteId") Long siteId) throws IOException {
        return finansService.totalApartmanGider(siteId);

    }

}
