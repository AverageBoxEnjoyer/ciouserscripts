// ==UserScript==
// @name         Forum Profile Price
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Display calculated price of profiles
// @author       Box
// @match        *://cracked.io/*
// @grant        none
// @require      https://static.cracked.io/jscripts/jquery.js
// ==/UserScript==

(function() {
    'use strict';

    const awardsPrices = {
        "Premium": 9.99,
        "Supreme": 59.99,
        "Infinity": 34.99,
        "Credit Card": 50.00,
        "Member Upgrade": 10.00,
        "High Roller": 100.00,
        "The Holy Bitcoin": 50.00,
        "Summer Holidays": 75.00,
        "Pumpkin": 50.00,
        "Ruby Gem": 50.00
    };

    const awardsImages = {
        "Premium": "https://static.cracked.io/images/awards/diamond.svg",
        "Supreme": "https://static.cracked.io/images/awards/supreme.svg",
        "Infinity": "https://static.cracked.io/images/awards/infinity.svg",
        "Credit Card": "https://static.cracked.io/images/awards/credit-card.svg",
        "Member Upgrade": "https://static.cracked.io/images/awards/gift.svg",
        "High Roller": "https://static.cracked.io/images/awards/donatoraward.gif",
        "The Holy Bitcoin": "https://static.cracked.io/images/awards/bitcoin.svg",
        "Summer Holidays": "https://static.cracked.io/images/awards/holidays.png",
        "Pumpkin": "https://static.cracked.io/images/awards/pumpkin.png",
        "Ruby Gem": "https://static.cracked.io/images/awards/ruby_gem.gif"
    };

    function calculateTotalPriceAndAwards(userElement, isProfile) {
        let totalPrice = 0;
        let awardsBreakdown = "";
        let awardsCount = {};

        $(userElement).find("span[title='Premium'], span[title='Supreme'], span[title='Infinity'], span[title='Credit Card'], span[title='Member Upgrade'], span[title='High Roller'], span[title='The Holy Bitcoin'], span[title='Summer Holidays'], span[title='Pumpkin'], span[title='Ruby Gem']").each(function() {
            const awardTitle = $(this).attr("title");
            const awardPrice = awardsPrices[awardTitle] || 0;

            if (!awardsCount[awardTitle]) {
                awardsCount[awardTitle] = 0;
            }
            awardsCount[awardTitle]++;

            totalPrice += awardPrice;
        });

        for (const award in awardsCount) {
            const awardPrice = awardsPrices[award];
            const awardCount = awardsCount[award];
            const awardImage = awardsImages[award];
            const awardTotalPrice = (awardPrice * awardCount).toFixed(2);

            if (isProfile) {
                awardsBreakdown += `
                    <div class="trow1 x-smalltext d-flex align-items-center">
                        <img src="${awardImage}" alt="${award}" width="16" height="16"> ${award} x${awardCount} <span class="ml-auto">${awardTotalPrice}€</span>
                    </div>
                `;
            } else {
                awardsBreakdown += `
                    <div class="post-row">
                        <div class="post-icon">
                            <img src="${awardImage}" alt="${award}" width="16" height="16">
                        </div>
                        <div class="post-row-inner">
                            ${award} x${awardCount} <span class="ml-auto">${awardTotalPrice}€</span>
                        </div>
                    </div>
                `;
            }
        }

        return { totalPrice, awardsBreakdown };
    }

    function addProfilePriceElement(userElement) {
        const { totalPrice, awardsBreakdown } = calculateTotalPriceAndAwards(userElement, true);

        const priceElement = `
            <div class="trow1 x-smalltext">
                <div class="d-flex align-items-center">
                    Price: <span class="ml-auto"><a href="https://cracked.io/credits.php">${totalPrice.toFixed(2)}€</a></span> |
                    <span class="expcolimage" style="cursor: pointer;">
                        <img src="https://static.cracked.io/images/collapse_collapsed.png" alt="[+]" title="[+]">
                    </span>
                </div>
            </div>
            <div class="profile-awards-breakdown" style="display: none;">
                ${awardsBreakdown}
            </div>
        `;

        const hasWarningLevel = $("div.trow1:contains('Warning Level')").length > 0;

        if (hasWarningLevel) {
            $("div.trow1:contains('Warning Level')").after(priceElement);
        } else {
            $("div.xsmalltext.profile-links.trow1").before(priceElement);
        }

        $(".expcolimage").click(function() {
            $(this).closest(".trow1").next(".profile-awards-breakdown").toggle();
        });
    }

    function addPostbitPriceElement(userElement) {
        const { totalPrice, awardsBreakdown } = calculateTotalPriceAndAwards(userElement, false);

        const priceElement = `
            <div class="post-row">
                <div class="post-icon">
                    <i class="fas fa-money-bill"></i>
                </div>
                <div class="post-row-inner">
                    Price: <span class="ml-auto"><a href="https://cracked.io/credits.php">${totalPrice.toFixed(2)}€</a></span> |
                    <span class="expcolimage" style="cursor: pointer;">
                        <img src="https://static.cracked.io/images/collapse_collapsed.png" alt="[+]" title="[+]">
                    </span>
                </div>
            </div>
            <div class="post-awards-breakdown" style="display: none;">
                ${awardsBreakdown}
            </div>
        `;

        $(userElement).find(".post-statistics").append(priceElement);

        $(".expcolimage").click(function() {
            $(this).closest(".post-row").next(".post-awards-breakdown").toggle();
        });
    }

    $(document).ready(function() {
        const isProfilePage = /cracked\.io\/\w+$/.test(window.location.href);

        if (isProfilePage) {
            addProfilePriceElement($("body"));
        } else {
            $(".post-author").each(function() {
                addPostbitPriceElement($(this));
            });
        }
    });
})();
