/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Sep 2022     rextec
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response){
	var str = '<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">'+
	'<pdf>'+
	'<head>'+
	'<link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />'+
	'<#if .locale == "zh_CN">'+
	'<link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />'+
	'<#elseif .locale == "zh_TW">'+
	'<link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />'+
	'<#elseif .locale == "ja_JP">'+
	'<link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />'+
	'<#elseif .locale == "ko_KR">'+
	'<link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />'+
	'<#elseif .locale == "th_TH">'+
	'<link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />'+
	'</#if>'+
	'    <style type="text/css">'+
	'table { font-size: 9pt; table-layout: fixed; width: 100%; }* {'+
	'<#if .locale == "zh_CN">'+
	'font-family: NotoSans, NotoSansCJKsc, sans-serif;'+
	'<#elseif .locale == "zh_TW">'+
	'font-family: NotoSans, NotoSansCJKtc, sans-serif;'+
	'<#elseif .locale == "ja_JP">'+
	'font-family: NotoSans, NotoSansCJKjp, sans-serif;'+
	'<#elseif .locale == "ko_KR">'+
	'font-family: NotoSans, NotoSansCJKkr, sans-serif;'+
	'<#elseif .locale == "th_TH">'+
	'font-family: NotoSans, NotoSansThai, sans-serif;'+
	'<#else>'+
	'font-family: NotoSans, sans-serif;'+
	'</#if>'+
	'}'+
     '</style>'+
     '</head>'+
     '<body padding="0.5in 0.5in 0.5in 0.5in" size="Letter">';//A4-LANDSCAPE
	
	
	
				//入庫予定のご案内
//	 str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '<td width="110px"></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td style="border: 0;"></td>'+
//		 '<td style="border: 0;"></td>'+
//		 '<td colspan="2" align="center" corner-radius="1%" style="font-weight: bold;font-size: 20px;border: 2px solid black;">入庫予定のご案内</td>'+
//		 '<td style="border: 0;"></td>'+
//		 '<td style="border: 0;"></td>'+
//		 '</tr>'+
//		 '</table>'+
//		 '<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="50px"></td>'+
//		 '<td width="83px"></td>'+
//		 '<td width="92.5px"></td>'+
//		 '<td width="92.5px"></td>'+
//		 '<td width="92.5px"></td>'+
//		 '<td width="84.5px"></td>'+
//		 '<td width="82.5px"></td>'+
//		 '<td width="82.5px"></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td style="font-weight: bold;font-size:20px" colspan="5" >景品倉庫（株)</td>'+
//		 '<td colspan="2" rowspan="2" align="right" style="vertical-align:middle">2022/8/3</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td style="font-weight: bold;font-size:20px" colspan="4">山下綿頭流通センター</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td style="font-size: 12px;" colspan="4">Tel:045-681-1041&nbsp;Fax:045-681-1041</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 15px;">&nbsp;&nbsp;いつもお世話になっております。</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 15px;">&nbsp;&nbsp;失礼ですが、次の貨物の入庫予定を教えてください。</td>'+
//		 '</tr>'+
//		 '</table>'+
//		 '<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="60px"></td>'+
//		 '<td width="50px"></td>'+
//		 '<td width="60px"></td>'+
//		 '<td width="70px"></td>'+
//		 '<td width="70px"></td>'+
//		 '<td width="130px"></td>'+
//		 '<td width="120px"></td>'+
//		 '<td width="100px"></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-weight: bold;font-size: 16px;">種類：SILAB社化粧品原料</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;vertical-align:middle">商品名</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;vertical-align:middle">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;vertical-align:middle">入庫番号</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">INS-5/INSTENSYL</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220621-0632</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58221</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>入目</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>個数</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>カートン数</span><br/><span style="text-align:center;">(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>総重量</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">保証期間1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">5</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">4</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">40</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2023/12/21</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;">商品名</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">入庫番号</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">FILM/FILMEXEL</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220620-0520</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58224</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>入目</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>個数</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>カートン数</span><br/><span>(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>総重量</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">保証期間1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">0.25</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">12</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">1</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">3</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2024/02/10</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;">商品名</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">入庫番号</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">OSI/OSILIFT</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220706-0133</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58225</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>入目</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>個数</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>カートン数</span><br/><span>(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>総重量</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">保証期間1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">1</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">25</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">50</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2024/01/21</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="center" style="font-size: 15px;border: 1px solid black;">商品名</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">Lot#</td>'+
//		 '<td align="center" style="font-size: 15px;border: 1px solid black;">入庫番号</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="4" align="left" style="font-size: 15px;vertical-align: top;font-weight: bold;border: 1px solid black;">POL-EL/POLYLIFTEL</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">220621-0632</td>'+
//		 '<td align="left" style="vertical-align: top;font-weight: bold;font-size: 15px;border: 1px solid black;">58221</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>入目</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>個数</span><br/><span>(btl)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>カートン数</span><br/><span>(ctn)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;"><span>総重量</span><br/><span>(kg)</span></td>'+
//		 '<td align="center" style="font-size: 13px;border: 1px solid black;">保証期間1</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">5</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">4</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2</td>'+
//		 '<td align="right" style="font-size: 15px; font-weight: bold;border: 1px solid black;">40</td>'+
//		 '<td align="center" style="font-size: 15px; font-weight: bold;border: 1px solid black;">2023/12/21</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 13px; font-weight: bold;">入庫予定日:2022/08/04</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size: 13px; font-weight: bold;vertical-align:bottom;">&nbsp;&nbsp;作業完了希望日:</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td align="right"><input type="checkbox" name="answer4" value="在庫品" /></td>'+
//		 '<td style="font-size: 13px;font-weight: bold;">在庫品</td>'+
//		 '<td align="right"><input type="checkbox" name="answer5" value="出荷予定有り" /></td>'+
//		 '<td style="font-size: 13px;font-weight: bold">出荷予定有り</td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr height="10px"></tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td colspan="7" style="font-size:13px">入庫後、入庫報告書をファックスで送ってください。</td>'+
//		 '</tr>'+
//		 '</table>'+
//		 '<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//		 '<tr>'+
//		 '<td width="250px"></td>'+
//		 '<td width="100px"></td>'+
//		 '<td width="80px"></td>'+
//		 '<td width="100px"></td>'+
//		 '<td width="130px"></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  rowspan="2" style="font-size: 20px;font-weight: bold;">SCETI</td>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  colspan="2" style="font-size: 12px;">株式会社セティ</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  colspan="3" style="font-size: 12px;">東京都千代田区霞が関3-6-1</td>'+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td colspan="3" style="font-size: 12px;">Tel:123456 &nbsp;&nbsp;&nbsp; FAX:123456123</td>'+
//		 '</tr>'+
//		 '<tr height="10px">'+
//		 ''+
//		 '</tr>'+
//		 '<tr>'+
//		 '<td></td>'+
//		 '<td></td>'+
//		 '<td  style="font-weight: bold;font-size: 12px;">担当:</td>'+
//		 '<td colspan="2" style="font-weight: bold;font-size: 12px;">test</td>'+
//		 '</tr>'+
//		 '</table>'; 

	
	
	
	
	
				//ラヘル作業指示書
	
//	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'<td width="132px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td align="center" style="border-bottom: 2px solid black;font-size: 13px;text-align: center;font-weight: bold;vertical-align:bottom">ラベル作業指導書</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 11px;text-align: center;">2022年8月4日</td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;">ケイヒン倉庫(株)</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;">山下埠頭流通センター&nbsp;&nbsp;尾上様</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;">TEL:045-681-1041&nbsp;&nbsp;&nbsp;&nbsp;FAX:045-681-1041</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;">毎度お世話になっております。</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="5" style="font-size: 13px;">ラベルを貼る作業を行ってください。</td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr height="20px">'+
//	'<td width="130px"></td>'+
//	'<td width="200px"></td>'+
//	'<td width="110px"></td>'+
//	'<td width="50px"></td>'+
//	'<td width="50px"></td>'+
//	'<td width="70"></td>'+
//	'<td width="50px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="text-align: center;font-size: 13px;font-weight: bold;">入庫予定日:</td>'+
//	'<td align="left" style="text-align: left;font-size: 13px;font-weight: bold;">2022年8月9日(火)AM</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="2" style="font-size: 13px;font-weight: bold;margin-left: 35px;">PO#:&nbsp;&nbsp;8003157-1</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td colspan="5" style="font-size: 13px;font-weight: bold;padding-left: 40px;vertical-align: top;"><div style="width: 8px;height: 8px;border: 1px solid black; background-color: black;display: inline-block;"></div>分析表は後日メールします。</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-left: 1px solid black;border-right: 1px solid black;border-top: 1px solid black;">商品コード</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;">品名(英名)</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;">Lot#</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">入目</span><br/><span style="text-align:center">(kg)</span></td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">袋数</span><br/><span style="text-align:center">(bag)</span></td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">カートン数</span><br/><span style="text-align:center">(ctn)</span></td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;vertical-align:middle; border-top: 1px solid black;border-right: 1px solid black;"><span style="text-align:center">総重量</span><br/><span style="text-align:center">(kg)</span></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-left: 1px solid black;border-right: 1px solid black;border-top: 1px solid black;">10015-GR107A-20</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">GTF CHROMIUM YEAST</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">127000/69-258</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">20</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">1</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">3</td>'+
//	'<td align="right" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;">60</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-left: 1px solid black;vertical-align:middle; border-right: 1px solid black;border-top: 1px solid black;">原材料名</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">品名(和名)</td>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">賞味期限</td>'+
//	'<td align="center" colspan="2" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">内袋ラベル<br/>(枚)</td>'+
//	'<td align="center" colspan="2" style="font-size: 13px;text-align: center;border-top: 1px solid black;vertical-align:middle; border-right: 1px solid black;">外箱ラベル<br/>(枚)</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-left: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;border-top: 1px solid black;">酵母</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">クロム含有酵母</td>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">2024.3.2</td>'+
//	'<td align="right" colspan="2" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">3</td>'+
//	'<td align="right" colspan="2" style="font-size: 13px;text-align: right;font-weight: bold;border-top: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">3</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 13px;text-align: center;border-left: 1px solid black;vertical-align:middle; border-right: 1px solid black;border-bottom: 1px solid black;">名称</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 13px;text-align: left;font-weight: bold;border-left: 1px solid black;border-right: 1px solid black;border-bottom: 1px solid black;">酵母</td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr height="20px"></tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="25px"></td>'+
//	'<td width="280px"></td>'+
//	'<td width="10px"></td>'+
//	'<td width="300px"></td>'+
//	'<td width="45px"></td>'+
//	'</tr>'+
//	'<tr height="75">'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: bottom;border-top: 1px dotted black;border-left: 1px dotted black; border-right: 1px dotted black;">ここに外箱用見本ラヘルを</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: bottom;border-top: 1px dotted black;border-left: 1px dotted black; border-right: 1px dotted black;">ここに内袋用見本ラベルを</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr height="75">'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: top;border-left: 1px dotted black; border-right: 1px dotted black;border-bottom: 1px dotted black;">貼付して下さい。</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 13px;font-weight: bold; text-align:center;vertical-align: top;border-left: 1px dotted black; border-right: 1px dotted black;border-bottom: 1px dotted black;">貼付して下さい。</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr height="20px">'+
//	'<td width="20px"></td>'+
//	'<td width="160px"></td>'+
//	'<td width="51px"></td>'+
//	'<td width="51px"></td>'+
//	'<td width="51px"></td>'+
//	'<td width="31px"></td>'+
//	'<td width="61px"></td>'+
//	'<td width="30px"></td>'+
//	'<td width="170px"></td>'+
//	'<td width="35px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td style="vertical-align: top; font-size: 10px;text-align: center;font-weight: bold;">セティ確認欄<br/>ラベルを確認しましたので<br/>作業を進めて下さい。</td>'+
//	'<td style="border: 1px solid black;"></td>'+
//	'<td style="border-top: 1px solid black;border-bottom: 1px solid black;"></td>'+
//	'<td style="border: 1px solid black;"></td>'+
//	'<td style="text-align: right;"><input type="checkbox" name="check1" id="check1" /></td>'+
//	'<td style="font-size: 10px;text-align: left;font-weight: bold;">在庫品</td>'+
//	'<td style="text-align: right;"><input type="checkbox" name="check2" id="check2" /></td>'+
//	'<td style="font-size: 10px;text-align: left;font-weight: bold;">出荷予定有り</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr height="20px">'+
//	'<td width="25px"></td>'+
//	'<td width="280px"></td>'+
//	'<td width="30px"></td>'+
//	'<td width="100px"></td>'+
//	'<td width="180px"></td>'+
//	'<td width="45px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td style="font-size: 20px; font-weight: bold;vertical-align: text-bottom;padding-left: 10px;">SCETI</td>'+
//	'<td style="font-size: 11px; font-weight: bold;vertical-align: text-bottom;">セティ株式会社</td>'+
//	'<td></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td colspan="4" style="font-size: 11px; font-weight: bold;vertical-align: text-bottom;">東京都千代田区霞が関3-6-7</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td></td>'+
//	'<td colspan="4" style="font-size: 11px; font-weight: bold;vertical-align: top;">TEL:03-5510-2668&nbsp;FAX:03-5510-0132</td>'+
//	'</tr>'+
//	'</table>';
	
	
					//出荷案内書(控)
//	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="80px"></td>'+
//	'<td width="37px"></td>'+
//	'<td width="140px"></td>'+
//	'<td width="86px"></td>'+
//	'<td width="75px"></td>'+
//	'<td width="75px"></td>'+
//	'<td width="92px"></td>'+
//	'<td width="75px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="8" align="center" style="font-size: 15px; font-weight: bold;color: #3E73DA;">出&nbsp;荷&nbsp;案&nbsp;内&nbsp;書&nbsp;(&nbsp;控&nbsp;)</td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td align="left" style="font-size: 10px;color: #3E73DA;font-weight: 600;vertical-align: bottom;">お届け先</td>'+
//	'<td align="left" style="font-size: 14px;color: #BEBDC3;vertical-align: bottom;" colspan="2">〒812-8582</td>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;">受注区分</td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;">出&nbsp;荷&nbsp;日</td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;">伝&nbsp;票&nbsp;No.</td>'+
//	'<td align="center" style="font-size: 11px;color: #3E73DA;font-weight: 600;vertical-align: bottom;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;">基準\'検定日</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="font-size: 11px;color: #BEBDC3;font-weight: 650;vertical-align: bottom;" colspan="4" >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;福岡県<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;福岡市東区馬出3-1-1<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;病院地区実験室</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-left:2px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">J</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">21-06-14</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:1px solid #3E73DA;">1000017439</td>'+
//	'<td align="center" style="font-size: 13px;color: #BEBDC3;vertical-align: middle;border-top:1px solid #3E73DA;border-bottom:2px solid #3E73DA;border-right:2px solid #3E73DA;">21-06-15</td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;国立大学法人九州大学アイソトープ総合センター</td>'+
//	'<td style="font-size: 10px;color: #3E73DA;vertical-align: middle;"><span style="margin-left:30px">販売元</span></td>'+
//	'<td colspan="3" style="color: #3E73DA; font-size: 13px;font-weight: bold;vertical-align: middle;"><span style="margin-left:15px">公益社団法人&nbsp;日本アイソトープ協会</span></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;芸術工学部デザイン人間科学部門</td>'+
//	'<td style="font-size: 10px;color: #3E73DA;vertical-align: middle;" rowspan="2"><span style="margin-left:30px">発売元</span></td>'+
//	'<td colspan="3" style="color: #3E73DA; font-size: 13px;font-weight: bold;vertical-align: middle;" rowspan="2"><span style="margin-left:15px">DENISディスカウント</span></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td colspan="4" style="font-size: 11px; color: #BEBDC3;font-weight: 650;vertical-align: bottom;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;植口 重和　様</td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
//	'<tr>'+
//	'<td width="428px"></td>'+
//	'<td width="116px"></td>'+
//	'<td width="116px"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 12px; color: #3E73DA; vertical-align: middle;font-weight: bold;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA">運&nbsp;&nbsp;送&nbsp;&nbsp;会&nbsp;&nbsp;社</td>'+
//	'<td align="center" style="font-size: 12px; color: #3E73DA; vertical-align: middle;font-weight: bold;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;">輸&nbsp;&nbsp;送&nbsp;&nbsp;区&nbsp;&nbsp;分</td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td></td>'+
//	'<td align="center" style="font-size: 14px;vertical-align: middle;color: #BEBDC3;border-top:1px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:2px solid #3E73DA;">日本通運</td>'+
//	'<td style="border-top:1px solid #3E73DA;border-right:2px solid #3E73DA;border-bottom:2px solid #3E73DA;"></td>'+
//	'</tr>'+
//	'</table>'+
//	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
//	'<tr>'+
//	'<td width="90px"></td>'+
//	'<td width="330px"></td>'+
//	'<td width="20px"></td>'+
//	'<td width="20px"></td>'+
//	'<td width="30px"></td>'+
//	'<td width="170px"></td>'+
//	'</tr>'+
//	'<tr height="10px"></tr>'+
//	'<tr>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">統一商品コード</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">品&nbsp;名&nbsp;規&nbsp;格&nbsp;/&nbsp;ロット&nbsp;No.</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-bottom:1px solid #3E73DA;">数</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">量</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:1px solid #3E73DA;border-bottom:1px solid #3E73DA;">取扱</td>'+
//	'<td align="center" style="font-size: 10px;vertical-align:middle; color: #3E73DA;border-top:2px solid #3E73DA;border-right:2px solid #3E73DA;border-bottom:1px solid #3E73DA;">備考</td>'+
//	'</tr>'+
//	'<tr height="10px">'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:1px dotted black;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td align="center" style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;">SM-2-U</td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:10px">Saliva Melationin RIA KIT 200tests / 74kBq</span></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;">1</td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:15px">発注番号:DQG70 / 注文番号:05</span></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"><span style="margin-left:20px">Lot.5234.17 &nbsp;&nbsp;&nbsp;&nbsp; 有効期間:21-07-20</span></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;">1</td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr height="200px">'+
//	'<td style="border-left:2px solid #3E73DA;border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px dotted black;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:1px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'<td style="border-right:2px solid #3E73DA;font-size:13px;color:#BEBDC3;"></td>'+
//	'</tr>'+
//	'<tr>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'<td style="border-bottom:2px solid #3E73DA;"></td>'+
//	'</tr>'+
//	'</table>';
	
				//讓渡書
	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="50px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="110px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" colspan="6" style="font-size: 18px; font-weight: bold;">讓&nbsp;&nbsp;&nbsp;&nbsp;渡&nbsp;&nbsp;&nbsp;&nbsp;書</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">讓渡書番号</td>'+
	'<td align="left" style="font-size: 13px;">1000017439</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">&nbsp;&nbsp;2021/06/14</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="3">国立大学法人九州大学7.イソップ総合</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: bottom;" colspan="3">放射線取扱主任者</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="2">山内 基弘</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="400px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">DENISファーマ株式会社</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">放射線取扱主任者</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">黒澤&nbsp;&nbsp;麻紀</td>'+
	'<td align="left" style="font-size: 13px;">印</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;" colspan="2">(販第479 号)</td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="300px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="50px">'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border:2px solid black;">納品先</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">芸術工学部デザイン人間科学部門</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">極口&nbsp;&nbsp;重和</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;border-right:2px solid black;">先生</td>'+
	'</tr>'+
	'<tr height="10px">'+
	'</tr>'+
	'<tr height="8px"></tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 13px;"><span style="margin-left:30px;">この度、下記の放射性同位元素を譲渡いたしますので、</span><br/><span style="margin-left:30px;">宜しくお取り計らい下さいますようお願い申し上げます。</span><br/><span style="margin-left:30px;">なお、製品ご査収の上、譲受書をお送り下さいますようお願い致します。</span></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="160px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="30px">'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-left:2px solid black;border-bottom:2px solid black;">製品名</td>'+
	'<td width="200px" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;"><span style="margin-left:150px;">規格</span></td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">核種</td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">容量</td>'+
	'<td width="160px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;">総放射能量(基準値)</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;" align="left">Saliva Melatonin RIA KIT 200tests / 74kBq</td>'+
	'<td style="font-size: 13px;vertical-align: middle;" align="center">I-125</td>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;"><span style="margin-left:50px">74KBQ × 1 = 74KBQ</span></td>'+
	'</tr>'+
	'<tr height="200px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="460px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">出荷予定日:</td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">2021/06/14</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">取引先</td>'+
	'</tr>'+
	'</table>';
	str+='<pbr/>';
	
	
	
	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="50px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="110px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" colspan="6" style="font-size: 18px; font-weight: bold;">讓&nbsp;&nbsp;&nbsp;&nbsp;渡&nbsp;&nbsp;&nbsp;&nbsp;書&nbsp;&nbsp;&nbsp;&nbsp;(控)</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">讓渡書番号</td>'+
	'<td align="left" style="font-size: 13px;">1000017439</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">&nbsp;&nbsp;2021/06/14</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="2">国立大学法人九州大学7.イソップ総合</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: bottom;" colspan="3">放射線取扱主任者</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;border-bottom: 2px solid black;" colspan="2">山内 基弘</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="400px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">DENISファーマ株式会社</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">放射線取扱主任者</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">黒澤&nbsp;&nbsp;麻紀</td>'+
	'<td align="left" style="font-size: 13px;">印</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;" colspan="2">(販第479 号)</td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="300px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="50px">'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border:2px solid black;">納品先</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">芸術工学部デザイン人間科学部門</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">極口&nbsp;&nbsp;重和</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;border-right:2px solid black;">先生</td>'+
	'</tr>'+
	'<tr height="10px">'+
	'</tr>'+
	'<tr height="8px"></tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 13px;"><span style="margin-left:50px;">この度、下記の放射性同位元素を譲渡いたしますので、</span><br/><span style="margin-left:50px;">宜しくお取り計らい下さいますようお願い申し上げます。</span><br/><span style="margin-left:50px;">なお、製品ご査収の上、譲受書をお送り下さいますようお願い致します。</span></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="160px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="30px">'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-left:2px solid black;border-bottom:2px solid black;">製品名</td>'+
	'<td width="200px" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;"><span style="margin-left:150px;">規格</span></td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">核種</td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">容量</td>'+
	'<td width="160px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;">総放射能量(基準値)</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;" align="left">Saliva Melatonin RIA KIT 200tests / 74kBq</td>'+
	'<td style="font-size: 13px;vertical-align: middle;" align="center">I-125</td>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;"><span style="margin-left:50px">74KBQ × 1 = 74KBQ</span></td>'+
	'</tr>'+
	'<tr height="200px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="460px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">出荷予定日:</td>'+
	'<td align="right" style="font-size: 13px;vertical-align: middle;">2021/06/14</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="right" style="font-size: 13px;vertical-align: middle;">メーカー控え</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="right" style="font-size: 13px;vertical-align: middle;">日本通運</td>'+
	'</tr>'+
	'</table>';
	str+='<pbr/>';
	
	
	
	str+='<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="50px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="110px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="center" colspan="6" style="font-size: 18px; font-weight: bold;">讓&nbsp;&nbsp;&nbsp;&nbsp;受 &nbsp;&nbsp;&nbsp;&nbsp;書&nbsp;&nbsp;&nbsp;&nbsp;(控)</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">讓渡書番号</td>'+
	'<td align="left" style="font-size: 13px;">1000017439</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;">&nbsp;&nbsp;2021/06/14</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;" colspan="2">DENISファーマ株式会社</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: bottom;" colspan="3">放射線取扱主任者&nbsp;&nbsp;&nbsp;&nbsp;黒澤麻紀</td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td align="left" style="font-size: 13px;vertical-align: middle;" colspan="2"></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'<td></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="300px"></td>'+
	'<td width="280px"></td>'+
	'<td width="80px"></td>'+
	'</tr>'+
	'<tr height="7px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;border-bottom: 2px solid black;" colspan="2">国立大学法人九州大学アイソトープ総合センター</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;vertical-align:top;">放射線取扱主任者</td>'+
	'<td></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="left" style="font-size: 13px;border-bottom: 2px solid black;">山内 &nbsp;基弘</td>'+
	'<td align="left" style="font-size: 13px;border-bottom: 2px solid black;">印</td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;" colspan="2"></td>'+
	'</tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="300px"></td>'+
	'<td width="200px"></td>'+
	'<td width="60px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="50px">'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border:2px solid black;">納品先</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">芸術工学部デザイン人間科学部門</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">極口&nbsp;&nbsp;重和</td>'+
	'<td align="center" rowspan="2" style="font-size: 15px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;border-right:2px solid black;">先生</td>'+
	'</tr>'+
	'<tr height="10px">'+
	'</tr>'+
	'<tr height="8px"></tr>'+
	'<tr>'+
	'<td colspan="4" style="font-size: 13px;"><span style="margin-left:50px;">この度、貴社より譲渡された下記の放射性同位元素を受領しましたので、</span><br/><span style="margin-left:50px;">お知らせ致します。</span></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="100px"></td>'+
	'<td width="200px"></td>'+
	'<td width="100px"></td>'+
	'<td width="100px"></td>'+
	'<td width="160px"></td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr height="30px">'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-left:2px solid black;border-bottom:2px solid black;">製品名</td>'+
	'<td width="200px" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;"><span style="margin-left:150px;">規格</span></td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">核種</td>'+
	'<td width="100px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-bottom:2px solid black;">容量</td>'+
	'<td width="160px" align="center" style="font-size: 13px;vertical-align: middle;border-top:2px solid black;border-right:2px solid black;border-bottom:2px solid black;">総放射能量(基準値)</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;" align="left">Saliva Melatonin RIA KIT 200tests / 74kBq</td>'+
	'<td style="font-size: 13px;vertical-align: middle;" align="center">I-125</td>'+
	'<td colspan="2" style="font-size: 13px;vertical-align: middle;"><span style="margin-left:50px">74KBQ × 1 = 74KBQ</span></td>'+
	'</tr>'+
	'<tr height="200px"></tr>'+
	'</table>'+
	'<table border="0" cellspacing="0" cellpadding="1" align="center" width="660px">'+
	'<tr>'+
	'<td width="360px"></td>'+
	'<td width="150px"></td>'+
	'<td width="150px"></td>'+
	'</tr>'+
	'<tr>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">受領年月日:</td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;border-bottom:2px solid black;">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</td>'+
	'</tr>'+
	'<tr height="10px"></tr>'+
	'<tr>'+
	'<td></td>'+
	'<td></td>'+
	'<td align="center" style="font-size: 13px;vertical-align: middle;">取引先→メーカー</td>'+
	'</tr>'+
	'</table>';
	str+='<pbr/>';
	
	
						//毒物及び劇物讓受書
	str+='<table border="1" cellspacing="0" cellpadding="1" width="660px" align="center">'+
	'<tr>'+
	'<td width="280px"></td>'+
	'<td width="50px"></td>'+
	'<td width="310px"></td>'+
	'<td width="50px"></td>'+
	'</tr>'+
	'<tr height="30px">'+
	'<td align="center" colspan="4" style="font-size: 18px;font-weight: bold;border-bottom:1px solid black;">毒物及び劇物讓受書</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">製品名称</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">Rat TSH [1125]RIA kit</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">製品コード</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">03089-RK-554</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" rowspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">毒物又は劇物の種類</td>'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">名称</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">アジ化ナトリウム</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">数量</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">Assay Buffer 3本(1%)</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">販売又は授与の年月日</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">2021年6月10日</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" rowspan="3" style="font-size: 15px;vertical-align: middle;border-right:1px solid black;">讓受人(法人にあっては、<br/>その名称及びまたる<br/>事務所の所在地)</td>'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">氏名</td>'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;"></td>'+
	'<td align="center" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;">印</td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;border-right:1px solid black;">職業</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;border-bottom:1px solid black;"></td>'+
	'</tr>'+
	'<tr height="35px">'+
	'<td align="left" style="font-size: 15px;vertical-align: middle;border-right:1px solid black;">住所</td>'+
	'<td align="left" colspan="2" style="font-size: 15px;vertical-align: middle;"></td>'+
	'</tr>'+
	'</table>';
	
	 str += '</body>'+
     '</pdf>';
	 var renderer = nlapiCreateTemplateRenderer();
		renderer.setTemplate(str);
		var xml = renderer.renderToString();
		var xlsFile = nlapiXMLToPDF(xml);
		
		// PDFファイル名を設定する
		xlsFile.setName('TestPDF出力' + '_' + getFormatYmdHms() + '.pdf');
		xlsFile.setFolder(FILE_CABINET_ID_DJ_REPAIR_GOODS_PDF);
		xlsFile.setIsOnline(true);
		
		// save file
		var fileID = nlapiSubmitFile(xlsFile);
		var fl = nlapiLoadFile(fileID);
		
		var url= URL_HEAD +'/'+fl.getURL();
		nlapiSetRedirectURL('EXTERNAL', url, null, null, null);
		nlapiLogExecution('debug', '見    積 pdf end');
}
