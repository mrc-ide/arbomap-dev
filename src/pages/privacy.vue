<template>
    <v-container class="page-text">
        <v-row>
            <v-col>
                <h1 class="text-h4">Privacy notice for arbomap.org</h1>
                <p class="text-body-1">
                    In accordance with data protection legislation and the privacy electronic communications
                    regulations, the privacy notice will:
                </p>
                <ul class="text-body-1">
                    <li>inform you as to how we look after your personal data when you visit our websites;</li>
                    <li>tell you about your privacy rights;</li>
                    <li>tell you how the law protects you.</li>
                </ul>
                <p class="text-body-1">
                    This policy is based on the
                    <a
                        href="https://www.imperial.ac.uk/about-the-site/privacy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        >Imperial College privacy policy</a
                    >.
                </p>

                <h2 class="text-h5">What do we collect?</h2>
                <p class="text-body-1">If you use this application we will record:</p>
                <ul class="text-body-1">
                    <li>Your IP address</li>
                    <li>Browser version details</li>
                    <li>Which areas of the website you visit</li>
                </ul>
                <p class="text-body-1">No other personal data is kept on our servers.</p>

                <h2 class="text-h5">How we use your personal data</h2>
                <p class="text-body-1">
                    We record this data to generate analytics reports on the usage of the site in order to improve it.
                </p>

                <h2 class="text-h5">Where we store your data</h2>
                <p class="text-body-1">We store your data on our own servers based in London, UK.</p>

                <h2 class="text-h5">How we keep your data secure</h2>
                <p class="text-body-1">
                    We have put in place appropriate security measures to prevent your personal data from being
                    accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we
                    limit access to your personal data to the administrators of arbomap.org, who have a business need to
                    know, and are subject to a duty of confidentiality.
                </p>

                <h2 class="text-h5">How long will we use your personal data for?</h2>
                <p class="text-body-1">
                    We may retain your personal data indefinitely to fulfil the purposes we collected it for, including
                    for the purposes of satisfying any legal, accounting, or reporting requirements.
                </p>
                <p class="text-body-1">We therefore will remove your data when the site is discontinued.</p>
                <p class="text-body-1">We will remove your data when you request we do so.</p>

                <h2 class="text-h5">Disclosing your information</h2>
                <p class="text-body-1">
                    We may pass on your personal information if we have a legal obligation to do so, or if we have to
                    enforce or apply our terms of use and other agreements.
                </p>
                <p class="text-body-1">
                    We will not share your information with any other organisation for marketing, market research, or
                    any other commercial purposes.
                </p>

                <h2 class="text-h5">Your rights</h2>
                <p class="text-body-1">
                    You can find out what information we hold about you by submitting a subject access request to
                    <a href="mailto:reside@imperial.ac.uk">reside@imperial.ac.uk</a> and ask us not to use the
                    information we collect.
                </p>
                <p class="text-body-1">
                    You also have the right to have data erased if it is no longer necessary for the purpose for which
                    it was originally collected/processed, or if there are no overriding legitimate grounds for the
                    processing. This is sometimes known as 'the right to be forgotten'. To find out more, please see
                    <a :href="rightsGuideUrl" target="_blank" rel="noopener noreferrer">
                        Guide 12 - Individual Rights | Administration and support services | Imperial College London
                    </a>
                </p>

                <h2 class="text-h5">Links to other websites</h2>
                <p class="text-body-1">
                    The arbomap.org website may contain links to other websites. This privacy policy applies to
                    arbomap.org only and doesn't cover other websites that we link to. These services have their own
                    terms and conditions and privacy policies. If you do go to another website from this one, read the
                    privacy policy on that website to find out what it does with your information.
                </p>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
const rightsGuideUrl =
    // eslint-disable-next-line max-len
    "https://www.imperial.ac.uk/admin-services/secretariat/information-governance/data-protection/internal-guidance/guide-10/";
</script>
