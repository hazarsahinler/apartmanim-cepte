package com.apartmanimcepte.backend.finance.controller;

import com.apartmanimcepte.backend.finance.bus.FinansService;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.*;
import com.apartmanimcepte.backend.identity.dto.ResponseDTO;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class FinansController {

    private final FinansService finansService;

    public FinansController(FinansService finansService) {
        this.finansService = finansService;
    }

    /**
     *dairelere borc eklemek için kullanıyoruz. Testleri başarılı.
     * @param borcTanimiCreateRequestDto
     * @return
     */
    @PostMapping("/finance/borc/ekle")
    public ResponseDTO borcEkle(@RequestBody BorcTanimiCreateRequestDTO borcTanimiCreateRequestDto) {
        return finansService.borcTanim(borcTanimiCreateRequestDto);
    }

    /**
     * Tüm borçları çekiyoruz.Filtreye göre.Test başarılı.
     * @param tanimlanmisBorcFiltreDTO
     * @return
     */
    @GetMapping("/finance/eklenen/borclar")
    public List<BorcTanimiResponseDTO> eklenenBorclar(TanimlanmisBorcFiltreDTO tanimlanmisBorcFiltreDTO) {
        return finansService.tanimlananBorclar(tanimlanmisBorcFiltreDTO);
    }

    /**
     * BorcIdsine göre dairelerin borçlarını döndürmek için.Test başarılı.
     * @param borcId
     * @return
     * @throws IOException
     */

    @GetMapping("/finance/daireler/borc/{borcId}")
    public List<DaireBorcResponseDTO> daireBorcResponseDTOS(@PathVariable ("borcId") Long  borcId) throws IOException {
        return finansService.daireBorclar(borcId);
    }

    /**
     * DaireId ile daireye ait verileri döndürmek için kullanılıyor.
     * @param daireId
     * @return
     * @throws IOException
     */
    @GetMapping("/finance/daire/borc/{daireId}")
    public List<DaireBorcResponseDTO> daireBorcResponseDTOList(@PathVariable ("daireId") Long  daireId) throws IOException {
        return finansService.daireBorc(daireId);
    }

    /**
     * Site Idsi alarak kullanıcıdan gelen borc odeme isteklerinin takibi.
     * @param siteId
     * @return
     * @throws IOException
     */
    @GetMapping("/finance/odeme/istekler/{siteId}")
    public List<BorcOdemeIstekResponseDTO> borcOdemeIstekler(@PathVariable ("siteId") Long siteId) throws IOException {
        return finansService.borcOdemeIstekler(siteId);
    }

    /**
     * Daire borc Id ile isteklerin kabul edilmesi
     * @param daireBorcId
     * @return
     * @throws IOException
     */
    @PostMapping("/finance/odeme/istek/kabul/{daireBorcId}")
    public ResponseDTO borcOde(@PathVariable ("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcIstekKabul(daireBorcId);
    }

    /**
     * Daire sakini bu api vasıtasıyla yöneticiye ödedim onayla diyecek.
     * @param daireBorcId
     * @return
     * @throws IOException
     */
    @PostMapping("/finance/odeme/istek/gonder/{daireBorcId}")
    public ResponseDTO borcOdemeIstegiGonder(@PathVariable ("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcOdemeIstegiGonder(daireBorcId);
    }
    /**
     * Daire sakini borç ödeme isteği gönderdiğinde, isteğin beklendiğini görmesi için borc ödeme istekler kısmını kontrol edeceğiz.
     * EĞer borç ödeme isteğinde o borçId ile onaylanmamış kayıt varsa UI kısmında "ONAY BEKLENİYOR" yazacak.
     * Eğer onaylanmış ise, "ONAYLANDI" yazak.
     */
    @GetMapping("/finance/odeme/istek/onay/durum/{daireBorcId}")
    public BorcOdemeIstekDurumResponseDTO borcOdemeIstekDurumKontrol(@PathVariable ("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcOdemeIstekDurum(daireBorcId);
    }
    /**
     * Daire borç tablosunda bulunan ödendiMi bilgisi == TRUE olan kayıtları bulup tutarlarını toplayarak toplam geliri döndürür.
     * Amaç total geliri görebilmesi daire sakinin.
     */
    @GetMapping("/finance/total/gelir/{siteId}")
    public TotalApartmanGelirResponseDTO totalApartmanGelir(@PathVariable ("siteId") Long siteId) throws IOException {
        return finansService.totalApartmanGelir(siteId);

    }
}
