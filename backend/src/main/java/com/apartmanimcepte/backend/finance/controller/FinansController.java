package com.apartmanimcepte.backend.finance.controller;

import com.apartmanimcepte.backend.finance.bus.FinansService;
import com.apartmanimcepte.backend.finance.dto.Request.BorcTanimiCreateRequestDTO;
import com.apartmanimcepte.backend.finance.dto.Request.TanimlanmisBorcFiltreDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcOdemeIstekResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.BorcTanimiResponseDTO;
import com.apartmanimcepte.backend.finance.dto.Response.DaireBorcResponseDTO;
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

    @GetMapping("/finance/odeme/istekler/{siteId}")
    public List<BorcOdemeIstekResponseDTO> borcOdemeIstekler(@PathVariable ("siteId") Long siteId) throws IOException {
        return finansService.borcOdemeIstekler(siteId);
    }
    @PostMapping("/finance/odeme/istek/kabul/{daireBorcId}")
    public ResponseDTO borcOde(@PathVariable ("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcIstekKabul(daireBorcId);
    }
    @PostMapping("/finance/odeme/istek/gonder/{daireBorcId}")
    public ResponseDTO borcOdemeIstegiGonder(@PathVariable ("daireBorcId") Long daireBorcId) throws IOException {
        return finansService.borcOdemeIstegiGonder(daireBorcId);
    }

}
